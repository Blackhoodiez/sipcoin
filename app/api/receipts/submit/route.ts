import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import PointsService, { PointsCalculation } from "@/lib/points-service";

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

    if (receipt.status !== "processed") {
      return NextResponse.json(
        { error: "Receipt must be processed before submission" },
        { status: 400 }
      );
    }

    if (!receipt.total_amount) {
      return NextResponse.json(
        { error: "Receipt total amount is required" },
        { status: 400 }
      );
    }

    // --- SECURITY ENHANCEMENTS ---
    // 1. OCR confidence threshold
    const ocrConfidence = receipt.metadata?.confidence;
    if (ocrConfidence !== undefined && ocrConfidence < 0.7) {
      return NextResponse.json({ error: "Low OCR confidence. Please retake the photo for better results." }, { status: 400 });
    }

    // 2. Receipt age validation (max 7 days old)
    if (receipt.transaction_date) {
      const receiptDate = new Date(receipt.transaction_date);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - receiptDate.getTime() > maxAge) {
        return NextResponse.json({ error: "Receipt is too old. Only receipts from the last 7 days are accepted." }, { status: 400 });
      }
    }

    // 3. Server-side validation of edited fields (amount/merchant)
    // Compare submitted values to OCR values (from receipt record)
    const ocrAmount = receipt.ocr_total_amount;
    const submittedAmount = receipt.total_amount;
    if (
      ocrAmount && submittedAmount && Math.abs(submittedAmount - ocrAmount) > ocrAmount * 0.1
    ) {
      return NextResponse.json({ error: "Submitted amount differs significantly from OCR result." }, { status: 400 });
    }
    // Optionally, check merchant name similarity (basic check)
    const ocrMerchant = receipt.ocr_merchant_name;
    const submittedMerchant = receipt.merchant_name;
    if (
      ocrMerchant && submittedMerchant && ocrMerchant.toLowerCase() !== submittedMerchant.toLowerCase()
    ) {
      if (
        ocrMerchant.length > 3 &&
        submittedMerchant.length > 3 &&
        !submittedMerchant.toLowerCase().includes(ocrMerchant.toLowerCase())
      ) {
        return NextResponse.json({ error: "Submitted merchant name is too different from OCR result." }, { status: 400 });
      }
    }
    // --- END SECURITY ENHANCEMENTS ---

    // Calculate points using the service
    const pointsCalculation = PointsService.calculatePoints({
      total_amount: receipt.total_amount,
      merchant_name: receipt.merchant_name,
      transaction_date: receipt.transaction_date,
      user_id: user.id,
    });

    // Duplicate check temporarily disabled for development
    // const duplicateCheck = await checkForDuplicateReceipt(
    //   supabase,
    //   user.id,
    //   receipt.merchant_name,
    //   receipt.total_amount,
    //   receipt.transaction_date
    // );
    //
    // if (duplicateCheck.isDuplicate) {
    //   return NextResponse.json(
    //     { error: "Duplicate receipt detected", duplicateReceipt: duplicateCheck.duplicateReceipt },
    //     { status: 409 }
    //   );
    // }

    // Update receipt with points earned
    const { data: updatedReceipt, error: updateError } = await supabase
      .from("receipts")
      .update({
        sipcoins_earned: pointsCalculation.totalPoints,
        status: "processed",
        metadata: {
          ...receipt.metadata,
          pointsCalculation,
          submitted_at: new Date().toISOString(),
        }
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

    // Update user's SipCoins balance
    const { error: balanceError } = await updateUserBalance(
      supabase,
      user.id,
      pointsCalculation.totalPoints
    );

    if (balanceError) {
      console.error("Balance update error:", balanceError);
      return NextResponse.json(
        { error: "Failed to update user balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      receipt: updatedReceipt,
      pointsEarned: pointsCalculation.totalPoints,
      pointsBreakdown: pointsCalculation.breakdown,
      message: "Receipt submitted successfully",
    });

  } catch (error) {
    console.error("Submit route error:", error);
    return NextResponse.json(
      { error: "Failed to submit receipt" },
      { status: 500 }
    );
  }
}

async function checkForDuplicateReceipt(
  supabase: any,
  userId: string,
  merchantName: string,
  totalAmount: number,
  transactionDate: string
) {
  if (!merchantName || !totalAmount || !transactionDate) {
    return { isDuplicate: false };
  }

  const date = new Date(transactionDate);
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const { data: existingReceipts, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("user_id", userId)
    .eq("merchant_name", merchantName)
    .eq("total_amount", totalAmount)
    .gte("transaction_date", startOfDay.toISOString())
    .lt("transaction_date", endOfDay.toISOString())
    .eq("status", "processed");

  if (error) {
    console.error("Duplicate check error:", error);
    return { isDuplicate: false };
  }

  return {
    isDuplicate: existingReceipts.length > 0,
    duplicateReceipt: existingReceipts[0] || null,
  };
}

async function updateUserBalance(supabase: any, userId: string, pointsToAdd: number) {
  // First, get current user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("sipcoins_balance")
    .eq("id", userId)
    .single();

  if (profileError) {
    // If profile doesn't exist, create one with initial balance
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        sipcoins_balance: pointsToAdd,
      });

    return insertError;
  }

  // Update existing balance
  const currentBalance = profile.sipcoins_balance || 0;
  const newBalance = currentBalance + pointsToAdd;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ sipcoins_balance: newBalance })
    .eq("id", userId);

  return updateError;
} 