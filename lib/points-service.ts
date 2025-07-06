export interface PointsCalculation {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  breakdown: {
    receiptAmount: number;
    firstVisitBonus: number;
    weekendBonus: number;
    specialPromotion: number;
  };
}

export interface ReceiptData {
  total_amount?: number;
  merchant_name?: string;
  transaction_date?: string;
  user_id: string;
}

export class PointsService {
  private static instance: PointsService;

  private constructor() {}

  public static getInstance(): PointsService {
    if (!PointsService.instance) {
      PointsService.instance = new PointsService();
    }
    return PointsService.instance;
  }

  calculatePoints(receipt: ReceiptData): PointsCalculation {
    if (!receipt.total_amount || receipt.total_amount <= 0) {
      throw new Error("Invalid receipt amount");
    }

    const basePoints = Math.floor(receipt.total_amount * 2); // 2 points per dollar
    
    let bonusPoints = 0;
    const breakdown = {
      receiptAmount: basePoints,
      firstVisitBonus: 0,
      weekendBonus: 0,
      specialPromotion: 0,
    };

    // First visit bonus (50 points for first visit to a merchant)
    // Note: This would need to be implemented with a proper check against user's receipt history
    breakdown.firstVisitBonus = 50;
    bonusPoints += 50;

    // Weekend bonus (25% extra points for weekend transactions)
    if (receipt.transaction_date) {
      const transactionDate = new Date(receipt.transaction_date);
      const dayOfWeek = transactionDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        breakdown.weekendBonus = Math.floor(basePoints * 0.25);
        bonusPoints += breakdown.weekendBonus;
      }
    }

    // Special promotion bonus (based on amount thresholds)
    if (receipt.total_amount >= 50) {
      breakdown.specialPromotion = 25;
      bonusPoints += 25;
    }

    // Additional bonus for high-value receipts
    if (receipt.total_amount >= 100) {
      const highValueBonus = Math.floor(receipt.total_amount * 0.1); // 10% bonus
      breakdown.specialPromotion += highValueBonus;
      bonusPoints += highValueBonus;
    }

    return {
      basePoints,
      bonusPoints,
      totalPoints: basePoints + bonusPoints,
      breakdown,
    };
  }

  // Helper method to validate points calculation
  validatePointsCalculation(calculation: PointsCalculation): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (calculation.basePoints <= 0) {
      errors.push("Base points must be greater than 0");
    }

    if (calculation.bonusPoints < 0) {
      errors.push("Bonus points cannot be negative");
    }

    if (calculation.totalPoints !== calculation.basePoints + calculation.bonusPoints) {
      errors.push("Total points calculation is incorrect");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Method to get points breakdown for display
  getPointsBreakdown(calculation: PointsCalculation) {
    return {
      base: calculation.breakdown.receiptAmount,
      firstVisit: calculation.breakdown.firstVisitBonus,
      weekend: calculation.breakdown.weekendBonus,
      promotion: calculation.breakdown.specialPromotion,
      total: calculation.totalPoints,
    };
  }
}

export default PointsService.getInstance(); 