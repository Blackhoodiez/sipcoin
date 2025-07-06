import Tesseract from "tesseract.js";
import fetch from "node-fetch";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const workerPath = require.resolve("tesseract.js/src/worker-script/node/index.js");

export interface ReceiptData {
  total_amount?: number;
  merchant_name?: string;
  merchant_address?: string;
  transaction_date?: string;
  transaction_time?: string;
  tax_amount?: number;
  subtotal_amount?: number;
  items?: string[];
}

export interface OCRResult {
  text: string;
  confidence: number;
  parsedData: ReceiptData;
}

export class OCRService {
  private static instance: OCRService;

  private constructor() {}

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async processImage(imageUrl: string): Promise<OCRResult> {
    try {
      console.log("Starting OCR processing for:", imageUrl);

      // Download the image to a buffer
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const buffer = await response.buffer();

      const result = await Tesseract.recognize(buffer, 'eng', {
        workerPath,
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        errorHandler: err => console.error("OCR Error:", err),
      });

      const ocrText = result.data.text;
      const confidence = result.data.confidence;
      
      console.log("OCR completed. Confidence:", confidence);
      console.log("Extracted text length:", ocrText.length);

      const parsedData = this.parseReceiptData(ocrText);

      return {
        text: ocrText,
        confidence,
        parsedData,
      };
    } catch (error) {
      console.error("OCR processing failed:", error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processBuffer(buffer: Buffer): Promise<OCRResult> {
    try {
      console.log("Starting OCR processing from buffer. Size:", buffer.length);

      const result = await Tesseract.recognize(buffer, "eng", {
        workerPath,
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        errorHandler: (err) => console.error("OCR Error:", err),
      });

      const { text: ocrText, confidence } = result.data;
      console.log("OCR completed from buffer. Confidence:", confidence);

      const parsedData = this.parseReceiptData(ocrText);
      return { text: ocrText, confidence, parsedData };
    } catch (error) {
      console.error("OCR processing from buffer failed:", error);
      throw new Error(
        `OCR processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private parseReceiptData(ocrText: string): ReceiptData {
    const lines = ocrText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const data: ReceiptData = {};

    // Enhanced patterns for better receipt parsing
    const patterns = {
      total: /(?:total|amount|sum|due|balance)[:\s]*\$?(\d+\.?\d*)/i,
      date: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      time: /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i,
      tax: /(?:tax|sales\s*tax|vat)[:\s]*\$?(\d+\.?\d*)/i,
      subtotal: /(?:subtotal|sub\s*total)[:\s]*\$?(\d+\.?\d*)/i,
      price: /\$?(\d+\.?\d*)/,
    };

    // Extract total amount (look for the highest amount that matches total pattern)
    let maxTotal = 0;
    for (const line of lines) {
      const totalMatch = line.match(patterns.total);
      if (totalMatch) {
        const amount = parseFloat(totalMatch[1]);
        if (amount > maxTotal && amount < 10000) { // Reasonable receipt amount
          maxTotal = amount;
        }
      }
    }
    if (maxTotal > 0) {
      data.total_amount = maxTotal;
    }

    // Fallback: pick the largest price anywhere if `total_amount` is still missing
    if (!data.total_amount) {
      let fallbackMax = 0;
      for (const line of lines) {
        const matches = [...line.matchAll(/\$?\d+\.\d{2}/g)];
        matches.forEach((m) => {
          const num = parseFloat(m[0].replace(/[^\d.]/g, ""));
          if (num > fallbackMax && num < 10000) fallbackMax = num;
        });
      }
      if (fallbackMax > 0) data.total_amount = fallbackMax;
    }

    // Extract date
    for (const line of lines) {
      const dateMatch = line.match(patterns.date);
      if (dateMatch && !data.transaction_date) {
        data.transaction_date = dateMatch[0];
        break;
      }
    }

    // Extract time
    for (const line of lines) {
      const timeMatch = line.match(patterns.time);
      if (timeMatch && !data.transaction_time) {
        data.transaction_time = timeMatch[0];
        break;
      }
    }

    // Extract tax amount
    for (const line of lines) {
      const taxMatch = line.match(patterns.tax);
      if (taxMatch && !data.tax_amount) {
        data.tax_amount = parseFloat(taxMatch[1]);
        break;
      }
    }

    // Extract subtotal
    for (const line of lines) {
      const subtotalMatch = line.match(patterns.subtotal);
      if (subtotalMatch && !data.subtotal_amount) {
        data.subtotal_amount = parseFloat(subtotalMatch[1]);
        break;
      }
    }

    // Extract merchant name (usually in first few lines, no numbers)
    const merchantLines = lines.slice(0, 8);
    for (const line of merchantLines) {
      if (line.length > 3 && line.length < 60 && 
          !line.match(/\d/) && 
          !line.toLowerCase().includes('total') &&
          !line.toLowerCase().includes('tax') &&
          !line.toLowerCase().includes('subtotal')) {
        data.merchant_name = line;
        break;
      }
    }

    // Extract items (lines with prices that aren't totals)
    const itemPattern = /\$?\d+\.?\d*/;
    data.items = lines
      .filter(line => {
        const hasPrice = itemPattern.test(line);
        const isNotTotal = !line.toLowerCase().includes('total');
        const isNotTax = !line.toLowerCase().includes('tax');
        const isNotSubtotal = !line.toLowerCase().includes('subtotal');
        const hasReasonableLength = line.length > 5 && line.length < 100;
        
        return hasPrice && isNotTotal && isNotTax && isNotSubtotal && hasReasonableLength;
      })
      .slice(0, 15); // Limit to first 15 items

    return data;
  }

  // Helper method to validate OCR results
  validateReceiptData(data: ReceiptData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.total_amount || data.total_amount <= 0) {
      errors.push("Total amount not found or invalid");
    }

    if (!data.merchant_name) {
      errors.push("Merchant name not found");
    }

    if (!data.transaction_date) {
      errors.push("Transaction date not found");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default OCRService.getInstance(); 