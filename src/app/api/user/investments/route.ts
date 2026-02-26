// app/api/user/investments/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const db = getDb();

    // Fetch investments with yesterday's interest from the log
    const [investments]: any = await db.query(
      `SELECT 
        i.id,
        i.userId,
        i.planId,
        i.amount,
        i.startDate,
        i.endDate,
        i.compoundingPeriod,
        i.status,
        i.currentInterest,
        i.expectedInterest,
        p.name as planName,
        p.interestRate,
        -- Get yesterday's interest from log (most recent entry)
        COALESCE(
          (SELECT interestEarned 
           FROM daily_interest_log 
           WHERE investmentId = i.id 
           ORDER BY calculationDate DESC 
           LIMIT 1),
          0
        ) as yesterdayInterest
       FROM investments i
       LEFT JOIN investment_plans p ON i.planId = p.id
       WHERE i.userId = ?
       ORDER BY i.createdAt DESC`,
      [userId]
    );

    const enrichedInvestments = investments.map((inv: any) => ({
      id: inv.id,
      status: inv.status,
      planId: inv.planId,
      planName: inv.planName || 'Unknown Plan',
      amount: Number(inv.amount),
      maturityDate: inv.endDate,
      startDate: inv.startDate,
      currentInterest: Number(inv.currentInterest) || 0,
      expectedInterest: Number(inv.expectedInterest) || 0,
      yesterdayInterest: Number(inv.yesterdayInterest) || 0,
      currentValue: Number(inv.amount) + Number(inv.currentInterest || 0),
    }));

    return NextResponse.json({
      status: true,
      investments: enrichedInvestments,
    });

  } catch (err: any) {
    console.error("FETCH INVESTMENTS ERROR:", err);
      return NextResponse.json(
    { error: "Service unavailable. Please try again later." },
    { status: 503 }
  );
  }
}