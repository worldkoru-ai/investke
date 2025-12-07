// /app/api/invest/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserById, getPlanById, createInvestment, updateUserWallet,updateUserTotalInvested } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, planId, amount } = await req.json();

    if (!userId || !planId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const plan = await getPlanById(planId);
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return NextResponse.json({ error: `Amount must be between ${plan.minAmount} and ${plan.maxAmount}` }, { status: 400 });
    }

    if (user.walletBalance < amount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    await updateUserWallet(userId, user.walletBalance - amount);



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

    return NextResponse.json({ message: "Investment successful", walletBalance: user.walletBalance - amount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
