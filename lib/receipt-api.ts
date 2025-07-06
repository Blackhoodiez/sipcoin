import { supabase } from "@/lib/supabase/client";

export interface ReceiptUploadResponse {
  success: boolean;
  receipt?: any;
  message?: string;
  error?: string;
}

export interface ReceiptProcessResponse {
  success: boolean;
  receipt?: any;
  ocrText?: string;
  parsedData?: any;
  error?: string;
}

export interface ReceiptSubmitResponse {
  success: boolean;
  receipt?: any;
  pointsEarned?: number;
  pointsBreakdown?: any;
  message?: string;
  error?: string;
}

export class ReceiptAPI {
  static async uploadReceipt(file: File): Promise<ReceiptUploadResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Upload failed",
        };
      }

      return {
        success: true,
        receipt: data.receipt,
        message: data.message,
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: "Upload failed. Please try again.",
      };
    }
  }

  static async processReceipt(receiptId: string): Promise<ReceiptProcessResponse> {
    try {
      const response = await fetch("/api/receipts/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiptId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Processing failed",
        };
      }

      return {
        success: true,
        receipt: data.receipt,
        ocrText: data.ocrText,
        parsedData: data.parsedData,
      };
    } catch (error) {
      console.error("Process error:", error);
      return {
        success: false,
        error: "Processing failed. Please try again.",
      };
    }
  }

  static async submitReceipt(receiptId: string): Promise<ReceiptSubmitResponse> {
    try {
      const response = await fetch("/api/receipts/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiptId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Submission failed",
        };
      }

      return {
        success: true,
        receipt: data.receipt,
        pointsEarned: data.pointsEarned,
        pointsBreakdown: data.pointsBreakdown,
        message: data.message,
      };
    } catch (error) {
      console.error("Submit error:", error);
      return {
        success: false,
        error: "Submission failed. Please try again.",
      };
    }
  }

  static async getUserReceipts() {
    try {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, receipts: data };
    } catch (error) {
      console.error("Get receipts error:", error);
      return { success: false, error: "Failed to fetch receipts" };
    }
  }

  static async getUserBalance() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("sipcoins_balance")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, balance: data?.sipcoins_balance || 0 };
    } catch (error) {
      console.error("Get balance error:", error);
      return { success: false, error: "Failed to fetch balance" };
    }
  }

  static async updateReceipt({ id, merchant_name, transaction_date, total_amount, items }: {
    id: string;
    merchant_name: string;
    transaction_date: string;
    total_amount: number;
    items: string[];
  }): Promise<{ success: boolean; error?: string; receipt?: any }> {
    try {
      const response = await fetch("/api/receipts/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, merchant_name, transaction_date, total_amount, items }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Update failed" };
      }
      return { success: true, receipt: data.receipt };
    } catch (error) {
      console.error("Update error:", error);
      return { success: false, error: "Update failed. Please try again." };
    }
  }
} 