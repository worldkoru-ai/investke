// app/api/invest/wallet/route.ts
import { NextResponse } from "next/server";
import { getDb, getPlanById, getPlanByName } from "@/lib/db";
import { calculateInvestmentInterest } from "@/lib/interestcalculation";

export async function POST(req: Request) {
  try {
    const { userId, planName, amount } = await req.json();

    if (!userId || !planName || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: userId, planId, amount" },
        { status: 400 }
      );
    }

    const db = getDb();

    // 1. Get user
    const [users]: any = await db.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // 2. Check wallet balance
    if (user.walletBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // 3. Get plan
    const plan = await getPlanByName(planName);
    const planId = plan?.id;
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // 4. Validate amount
    // if (amount < plan.minAmount || amount > plan.maxAmount) {
    //   return NextResponse.json(
    //     { error: `Amount must be between ${plan.minAmount} and ${plan.maxAmount}` },
    //     { status: 400 }
    //   );
    // }

    // 5. Check for existing active investment with same plan
    const [existingInvestments]: any = await db.query(
      `SELECT * FROM investments 
       WHERE userId = ? AND planId = ? AND status = 'active' 
       LIMIT 1`,
      [userId, planId]
    );

    if (existingInvestments.length > 0) {
      // TOP UP existing investment - simply add to principal
      const existing = existingInvestments[0];

      const existingAmount = Number(existing.amount) || 0;
      const newAmount = Number(amount) || 0;
      const newPrincipal = existingAmount + newAmount;

      // Recalculate expected interest with new principal
      const newInterestCalc = calculateInvestmentInterest({
        amount: newPrincipal,
        interestRate: plan.interestRate,
        startDate: new Date(existing.startDate),
        endDate: new Date(existing.endDate),
        compoundingPeriod: plan.compoundingPeriod,
      });

      await db.query(
        `UPDATE investments 
        SET amount = ?, 
            expectedInterest = ?,
            updatedAt = NOW()
        WHERE id = ?`,
        [
          newPrincipal.toFixed(2),
          newInterestCalc.expectedInterest,
          existing.id
        ]
      );

      // Deduct from wallet and create transaction
      await db.query("UPDATE users SET walletBalance = walletBalance - ? WHERE id = ?", [amount, userId]);
      await db.query("UPDATE users SET totalInvested = totalInvested + ? WHERE id = ?", [amount, userId]);
      await db.query(
        `INSERT INTO transactions (userId, amount, type, status, createdAt) 
        VALUES (?, ?, 'investment', 'completed', NOW())`,
        [userId, amount]
      );

      return NextResponse.json({
        status: true,
        message: "Investment topped up successfully from wallet",
        amountAdded: amount,
        previousPrincipal: existingAmount,
        newPrincipal,
        newExpectedInterest: newInterestCalc.expectedInterest,
        endDate: existing.endDate,
        type: "topup",
      });
    } else {
      // CREATE new investment
      const startDate = new Date();
      const endDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

      const interestCalc = calculateInvestmentInterest({
        amount,
        interestRate: plan.interestRate,
        startDate,
        endDate,
        compoundingPeriod: plan.compoundingPeriod,
      });

      // Create investment
      await db.query(
        `INSERT INTO investments 
         (userId, planId, amount, startDate, endDate, compoundingPeriod, 
          currentInterest, expectedInterest, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          planId,
          amount,
          startDate,
          endDate,
          plan.compoundingPeriod,
          0,
          interestCalc.expectedInterest,
          "active",
        ]
      );

      // Deduct from wallet
      await db.query(
        "UPDATE users SET walletBalance = walletBalance - ? WHERE id = ?",
        [amount, userId]
      );

      // Update total invested
      await db.query(
        "UPDATE users SET totalInvested = totalInvested + ? WHERE id = ?",
        [amount, userId]
      );

      // Create transaction record
      await db.query(
        `INSERT INTO transactions (userId, amount, type, status, createdAt) 
         VALUES (?, ?, 'investment', 'completed', NOW())`,
        [userId, amount]
      );

      return NextResponse.json({
        status: true,
        message: "Investment created successfully from wallet",
        amountInvested: amount,
        expectedInterest: interestCalc.expectedInterest,
        startDate,
        endDate,
        type: "new",
      });
    }
  } catch (err: any) {
    console.error("WALLET INVESTMENT ERROR:", err);
    return NextResponse.json(
      { error: "Investment failed", details: err.message },
      { status: 500 }
    );
  }
}