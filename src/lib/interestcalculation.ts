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
  progressPercentage: number; // percentage of time elapsed
  effectiveAnnualRate: number; // actual annual return considering compounding
  yesterdayInterest: number; // interest earned yesterday
  yesterdayValue: number; // value at end of yesterday
}

/**
 * Calculate compound interest for an investment
 * @param investment - Investment details
 * @param asOfDate - Date to calculate interest as of (defaults to today)
 * @returns Detailed interest calculation results
 * @throws Error if investment data is invalid
 */
export function calculateInvestmentInterest(
  investment: InvestmentData,
  asOfDate: Date = new Date()
): InterestResult {
  const { amount, interestRate, startDate, endDate, compoundingPeriod } = investment;

  // Validate inputs
  validateInvestmentData(investment);

  // Convert dates to timestamps for easier math
  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();
  // Cap current time at end date to prevent future projections
  const currentTime = Math.min(asOfDate.getTime(), endTime);

  // Calculate days
  const totalDays = Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.min(totalDays, Math.ceil((currentTime - startTime) / (1000 * 60 * 60 * 24))));

  // Get compounding frequency per year
  const compoundingFrequency = getCompoundingFrequency(compoundingPeriod);

  // Annual rate as decimal
  const r = interestRate / 100;

  // Calculate expected interest (at end date)
  // Using 365.25 to account for leap years
  const yearsTotal = totalDays / 365.25;
  const expectedValue = amount * Math.pow(1 + r / compoundingFrequency, compoundingFrequency * yearsTotal);
  const expectedInterest = expectedValue - amount;

  // Calculate current interest (as of today or end date, whichever is earlier)
  const yearsElapsed = daysElapsed / 365.25;
  const currentValue = amount * Math.pow(1 + r / compoundingFrequency, compoundingFrequency * yearsElapsed);
  const currentInterest = currentValue - amount;

  // Calculate yesterday's interest
  const { yesterdayInterest, yesterdayValue } = calculateYesterdayInterest(
    investment,
    asOfDate,
    compoundingFrequency,
    r
  );

  // Calculate effective annual rate (APY)
  const effectiveAnnualRate = (Math.pow(1 + r / compoundingFrequency, compoundingFrequency) - 1) * 100;

  // Progress percentage
  const progressPercentage = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

  return {
    currentInterest: Math.max(0, currentInterest),
    expectedInterest: Math.max(0, expectedInterest),
    currentValue,
    expectedValue,
    daysElapsed,
    totalDays,
    progressPercentage,
    effectiveAnnualRate,
    yesterdayInterest,
    yesterdayValue,
  };
}

/**
 * Calculate interest earned specifically yesterday
 */
function calculateYesterdayInterest(
  investment: InvestmentData,
  asOfDate: Date,
  compoundingFrequency: number,
  rateDecimal: number
): { yesterdayInterest: number; yesterdayValue: number } {
  const { amount, startDate, endDate } = investment;

  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();
  const currentTime = Math.min(asOfDate.getTime(), endTime);

  // Calculate yesterday's date
  const yesterdayTime = currentTime - (1000 * 60 * 60 * 24);
  const dayBeforeYesterdayTime = yesterdayTime - (1000 * 60 * 60 * 24);

  // If yesterday was before start date, no interest earned
  if (yesterdayTime < startTime) {
    return { yesterdayInterest: 0, yesterdayValue: amount };
  }

  // Calculate days from start to yesterday
  const daysToYesterday = Math.max(0, Math.ceil((yesterdayTime - startTime) / (1000 * 60 * 60 * 24)));
  const daysToDayBeforeYesterday = Math.max(0, Math.ceil((dayBeforeYesterdayTime - startTime) / (1000 * 60 * 60 * 24)));

  // Calculate value at end of yesterday
  const yearsToYesterday = daysToYesterday / 365.25;
  const yesterdayValue = amount * Math.pow(1 + rateDecimal / compoundingFrequency, compoundingFrequency * yearsToYesterday);

  // Calculate value at end of day before yesterday
  const yearsToDayBeforeYesterday = daysToDayBeforeYesterday / 365.25;
  const dayBeforeYesterdayValue = amount * Math.pow(1 + rateDecimal / compoundingFrequency, compoundingFrequency * yearsToDayBeforeYesterday);

  // Interest earned yesterday is the difference
  const yesterdayInterest = Math.max(0, yesterdayValue - dayBeforeYesterdayValue);

  return { yesterdayInterest, yesterdayValue };
}

/**
 * Calculate interest accrued over a specific number of days
 * @param principal - Initial investment amount
 * @param annualRate - Annual interest rate (percentage)
 * @param compoundingPeriod - How often interest compounds
 * @param days - Number of days to calculate interest for
 * @returns Total interest earned over the specified days
 */
export function calculateInterestForDays(
  principal: number,
  annualRate: number,
  compoundingPeriod: CompoundingPeriod,
  days: number
): number {
  if (principal <= 0) throw new Error("Principal must be positive");
  if (annualRate < 0) throw new Error("Annual rate cannot be negative");
  if (days < 0) throw new Error("Days cannot be negative");

  const frequency = getCompoundingFrequency(compoundingPeriod);
  const r = annualRate / 100;
  const years = days / 365.25;

  const finalAmount = principal * Math.pow(1 + r / frequency, frequency * years);
  return Math.max(0, finalAmount - principal);
}

/**
 * Calculate interest earned on a specific day
 * @param investment - Investment details
 * @param targetDate - The date to calculate interest for
 * @returns Interest earned on that specific day
 */
export function calculateInterestForSpecificDay(
  investment: InvestmentData,
  targetDate: Date
): number {
  const { amount, interestRate, startDate, endDate, compoundingPeriod } = investment;
  
  validateInvestmentData(investment);

  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();
  const targetTime = targetDate.getTime();

  // If target date is outside investment period, return 0
  if (targetTime < startTime || targetTime > endTime) {
    return 0;
  }

  const compoundingFrequency = getCompoundingFrequency(compoundingPeriod);
  const r = interestRate / 100;

  // Calculate days from start to target date
  const daysToTarget = Math.ceil((targetTime - startTime) / (1000 * 60 * 60 * 24));
  const daysToDayBefore = Math.max(0, daysToTarget - 1);

  // Value at end of target day
  const yearsToTarget = daysToTarget / 365.25;
  const targetDayValue = amount * Math.pow(1 + r / compoundingFrequency, compoundingFrequency * yearsToTarget);

  // Value at end of previous day
  const yearsToDayBefore = daysToDayBefore / 365.25;
  const previousDayValue = amount * Math.pow(1 + r / compoundingFrequency, compoundingFrequency * yearsToDayBefore);

  return Math.max(0, targetDayValue - previousDayValue);
}

/**
 * Get compounding frequency per year
 */
function getCompoundingFrequency(period: CompoundingPeriod | string): number {
  const normalizedPeriod = period.toLowerCase() as CompoundingPeriod;
  
  const frequencies: Record<CompoundingPeriod, number> = {
    daily: 365,
    weekly: 52.1429,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  };
  
  return frequencies[normalizedPeriod] || 365; // Default to daily if unknown
}

/**
 * Validate investment data
 * @throws Error if data is invalid
 */
function validateInvestmentData(investment: InvestmentData): void {
  const { amount, interestRate, startDate, endDate } = investment;

  if (amount <= 0) {
    throw new Error("Investment amount must be positive");
  }

  if (interestRate < 0) {
    throw new Error("Interest rate cannot be negative");
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (isNaN(start)) {
    throw new Error("Invalid start date");
  }

  if (isNaN(end)) {
    throw new Error("Invalid end date");
  }

  if (start >= end) {
    throw new Error("Start date must be before end date");
  }
}

/**
 * Calculate the future value of an investment
 * @param principal - Initial investment
 * @param annualRate - Annual interest rate (percentage)
 * @param years - Investment period in years
 * @param compoundingPeriod - How often interest compounds
 * @returns Future value of the investment
 */
export function calculateFutureValue(
  principal: number,
  annualRate: number,
  years: number,
  compoundingPeriod: CompoundingPeriod = "monthly"
): number {
  if (principal <= 0) throw new Error("Principal must be positive");
  if (annualRate < 0) throw new Error("Annual rate cannot be negative");
  if (years < 0) throw new Error("Years cannot be negative");

  const frequency = getCompoundingFrequency(compoundingPeriod);
  const r = annualRate / 100;

  return principal * Math.pow(1 + r / frequency, frequency * years);
}

/**
 * Calculate effective annual rate (APY) from nominal rate
 * @param nominalRate - Annual percentage rate
 * @param compoundingPeriod - How often interest compounds
 * @returns Effective annual rate (APY)
 */
export function calculateEffectiveAnnualRate(
  nominalRate: number,
  compoundingPeriod: CompoundingPeriod
): number {
  const frequency = getCompoundingFrequency(compoundingPeriod);
  const r = nominalRate / 100;
  return (Math.pow(1 + r / frequency, frequency) - 1) * 100;
}

/**
 * Format currency for display
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 * @param percentage - Percentage value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(percentage: number, decimals: number = 2): string {
  return `${percentage.toFixed(decimals)}%`;
}