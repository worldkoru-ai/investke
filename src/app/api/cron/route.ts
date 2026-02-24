// app/api/cron/update-interest/route.ts (or whatever your file is)
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calculateInvestmentInterest } from "@/lib/interestcalculation";

export async function GET(req: Request) {
  // Verify cron secret for security
  const authHeader = req.headers.get("authorization");
  console.log("Auth Header:", authHeader);
console.log("Expected:", `Bearer ${process.env.CRON_SECRET}`);
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get all active investments with their plan details
    // NOTE: Your table is called 'plans', not 'investment_plans'
    const [investments]: any = await db.query(
      `SELECT 
        i.id,
        i.userId,
        i.amount,
        i.startDate,
        i.endDate,
        i.compoundingPeriod,
        i.status,
        i.currentInterest as oldCurrentInterest,
        COALESCE(i.interestRate, p.interestRate) as interestRate
       FROM investments i
       LEFT JOIN plans p ON i.planId = p.id
       WHERE i.status = 'active'`
    );

    let updated = 0;
    let matured = 0;
    let errors = 0;

    for (const investment of investments) {
      try {
        // Normalize compounding period
        const normalizedPeriod = (investment.compoundingPeriod || 'daily').toLowerCase();

        // Calculate current interest
        const interestCalc = calculateInvestmentInterest({
          amount: Number(investment.amount),
          interestRate: Number(investment.interestRate),
          startDate: new Date(investment.startDate),
          endDate: new Date(investment.endDate),
          compoundingPeriod: normalizedPeriod,
        }, now);

        // Calculate today's interest earned (difference from yesterday)
        const oldCurrentInterest = Number(investment.oldCurrentInterest) || 0;
        const newCurrentInterest = interestCalc.currentInterest;
        const todayInterestEarned = Math.max(0, newCurrentInterest - oldCurrentInterest);

        // Update investment's current and expected interest
        await db.query(
          `UPDATE investments 
           SET currentInterest = ?,
               expectedInterest = ?,
               updatedAt = NOW()
           WHERE id = ?`,
          [newCurrentInterest, interestCalc.expectedInterest, investment.id]
        );

        // Log today's interest in the daily log
        await db.query(
          `INSERT INTO daily_interest_log 
           (investmentId, calculationDate, principalAmount, interestEarned, totalValue)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             principalAmount = VALUES(principalAmount),
             interestEarned = VALUES(interestEarned),
             totalValue = VALUES(totalValue),
             createdAt = NOW()`,
          [
            investment.id,
            today,
            investment.amount,
            todayInterestEarned,
            interestCalc.currentValue
          ]
        );

        // Check if investment has matured
        if (now >= new Date(investment.endDate)) {
          await db.query(
            `UPDATE investments 
             SET status = 'completed',
                 updatedAt = NOW()
             WHERE id = ?`,
            [investment.id]
          );
          matured++;
        }

        updated++;

      } catch (invErr: any) {
        console.error(`Error processing investment ${investment.id}:`, invErr);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily interest calculation completed`,
      stats: {
        updated,
        matured,
        errors,
        total: investments.length
      },
      timestamp: now.toISOString(),
      date: today
    });

  } catch (err: any) {
    console.error("CRON UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update investments", details: err.message },
      { status: 500 }
    );
  }
}