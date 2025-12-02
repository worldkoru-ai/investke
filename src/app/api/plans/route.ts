// app/api/plans/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const [rows]: any = await db.query("SELECT id,  name,  description,  interestRate AS interestRate,  minAmount AS minAmount,  maxAmount AS maxAmount, durationDays AS durationDays, compoundingPeriod AS compoundingPeriod FROM investment_plans ORDER BY id ASC");

    return NextResponse.json({ plans: rows }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/plans error:", err);
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  }
}
