

export type CompoundingPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

interface InvestmentData {
  amount: number;
  interestRate: number; // annual percentage rate
  startDate: Date;
  endDate: Date;
  compoundingPeriod: CompoundingPeriod;
}

interface InterestResult {
  currentInterest: number; // interest earned so far
  expectedInterest: number; // total interest to be earned by end date
  currentValue: number; // principal + current interest
  expectedValue: number; // principal + expected interest
  daysElapsed: number;
  totalDays: number;
}

/**
 * Calculate compound interest for an investment
 */
export function calculateInvestmentInterest(investment: InvestmentData, asOfDate: Date = new Date()): InterestResult {
  const { amount, interestRate, startDate, endDate, compoundingPeriod } = investment;
  
  // Convert dates to timestamps for easier math
  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();
  const currentTime = asOfDate.getTime();
  
  // Calculate days
  const totalDays = Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.min(totalDays, Math.ceil((currentTime - startTime) / (1000 * 60 * 60 * 24))));
  
  // Get compounding frequency per year
  const compoundingFrequency = getCompoundingFrequency(compoundingPeriod);
  
  // Annual rate as decimal
  const r = interestRate / 100;
  
  // Calculate expected interest (at end date)
  const yearsTotal = totalDays / 365;
  const expectedValue = amount * Math.pow(1 + r / compoundingFrequency, compoundingFrequency * yearsTotal);
  const expectedInterest = expectedValue - amount;
  
  // Calculate current interest (as of today)
  const yearsElapsed = daysElapsed / 365;
  const currentValue = amount * Math.pow(1 + r / compoundingFrequency, compoundingFrequency * yearsElapsed);
  const currentInterest = currentValue - amount;
  
  return {
    currentInterest: Math.max(0, currentInterest),
    expectedInterest: Math.max(0, expectedInterest),
    currentValue,
    expectedValue,
    daysElapsed,
    totalDays,
  };
}

/**
 * Get compounding frequency per year
 */
function getCompoundingFrequency(period: CompoundingPeriod): number {
  const frequencies: Record<CompoundingPeriod, number> = {
    daily: 365,
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  };
  return frequencies[period] || 365;
}

/**
 * Calculate daily interest accrual
 */
export function calculateDailyInterest(
  principal: number,
  annualRate: number,
  compoundingPeriod: CompoundingPeriod,
  days: number
): number {
  const frequency = getCompoundingFrequency(compoundingPeriod);
  const r = annualRate / 100;
  const years = days / 365;
  
  const finalAmount = principal * Math.pow(1 + r / frequency, frequency * years);
  return finalAmount - principal;
}