import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OCRService from "@/lib/ocr-service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { receiptId } = await request.json();

    if (!receiptId) {
      return NextResponse.json(
        { error: "Receipt ID is required" },
        { status: 400 }
      );
    }

    // Get receipt data
    const { data: receipt, error: receiptError } = await supabase
      .from("receipts")
      .select("*")
      .eq("id", receiptId)
      .eq("user_id", user.id)
      .single();

    if (receiptError || !receipt) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      );
    }

    // Update status to processing
    await supabase
      .from("receipts")
      .update({ 
        status: "processing",
        processing_attempts: receipt.processing_attempts + 1
      })
      .eq("id", receiptId);

    // Derive the storage object path (everything after `/receipts/`)
    const filePath = receipt.image_url.split("/receipts/")[1];
    if (!filePath) {
      return NextResponse.json(
        { error: "Invalid image URL for OCR" },
        { status: 400 }
      );
    }

    // Download the image directly from Supabase Storage
    const { data: fileBlob, error: downloadError } = await supabase
      .storage
      .from("receipts")
      .download(filePath);

    if (downloadError || !fileBlob) {
      console.error("Download error:", downloadError);
      return NextResponse.json(
        { error: "Failed to download receipt image" },
        { status: 500 }
      );
    }

    // Convert Blob → Buffer for Tesseract
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Perform OCR on the downloaded buffer
    const ocrResult = await OCRService.processBuffer(buffer);
    
    const ocrText = ocrResult.text;
    const parsedData = ocrResult.parsedData;

    // Update receipt with OCR results
    const { data: updatedReceipt, error: updateError } = await supabase
      .from("receipts")
      .update({
        ocr_text: ocrText,
        total_amount: parsedData.total_amount,
        merchant_name: parsedData.merchant_name,
        merchant_address: parsedData.merchant_address,
        transaction_date: parsedData.transaction_date,
        transaction_time: parsedData.transaction_time,
        tax_amount: parsedData.tax_amount,
        subtotal_amount: parsedData.subtotal_amount,
        status: parsedData.total_amount ? "processed" : "failed",
        processed_at: new Date().toISOString(),
        metadata: {
          items: parsedData.items,
          confidence: ocrResult.confidence,
        },
        ocr_total_amount: parsedData.total_amount,
        ocr_merchant_name: parsedData.merchant_name,
      })
      .eq("id", receiptId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update receipt" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      receipt: updatedReceipt,
      ocrText,
      parsedData,
    });

  } catch (error) {
    console.error("Process route error:", error);
    
    // Update receipt status to failed
    try {
      const supabase = await createClient();
      const { receiptId } = await request.json();
      
      await supabase
        .from("receipts")
        .update({ 
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error"
        })
        .eq("id", receiptId);
    } catch (updateError) {
      console.error("Failed to update error status:", updateError);
    }

    return NextResponse.json(
      { error: "OCR processing failed" },
      { status: 500 }
    );
  }
}