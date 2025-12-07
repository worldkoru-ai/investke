// app/api/invest/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { getDb, createInvestment, updateUserTotalInvested, getPlanById } from "@/lib/db";

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";
const PAYSTACK_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: Request) {
  if (!PAYSTACK_KEY) {
    return NextResponse.json({ error: "Missing PAYSTACK_SECRET_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  try {
    const db = getDb();

    // 1. Prevent double credit
    const [existing]: any = await db.query(
      "SELECT * FROM investments WHERE reference = ? LIMIT 1",
      [reference]
    );
    if (existing.length > 0) {
      return NextResponse.json({
        status: true,
        message: "Investment already recorded",
        data: existing[0],
      });
    }

    // 2. Verify with Paystack
    const res = await fetch(`${PAYSTACK_VERIFY_URL}/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_KEY}` },
    });

    const paystackData = await res.json();

    if (!res.ok || paystackData?.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful", details: paystackData },
        { status: 400 }
      );
    }

    const tx = paystackData.data;
    const amount = tx.amount / 100; // Paystack returns kobo
    const userId = tx.metadata?.userId;
    const planId = tx.metadata?.planId;

    if (!userId || !planId) {
      return NextResponse.json(
        { error: "Missing userId or planId in transaction metadata" },
        { status: 400 }
      );
    }

    const plan = await getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

   await createInvestment({
      userId,
      planId,
      amount,
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
      compoundingPeriod: plan.compoundingPeriod,
      status: "active",
    });

    await updateUserTotalInvested(userId, amount);

    return NextResponse.json({
      status: true,
      message: "Investment successful",
      userId,
      amountInvested: amount,
    });

  } catch (err: any) {
    console.error("VERIFY INVESTMENT ERROR:", err);
    return NextResponse.json(
      { error: "Verification failed", details: err.message },
      { status: 500 }
    );
  }
}
