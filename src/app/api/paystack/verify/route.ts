import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";
const PAYSTACK_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: Request) {
  if (!PAYSTACK_KEY) {
    return NextResponse.json(
      { error: "Missing PAYSTACK_SECRET_KEY" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "Missing transaction reference" },
      { status: 400 }
    );
  }

  try {
    /* -----------------------------------------
       ✅ 1. PREVENT DOUBLE CREDIT
    ------------------------------------------*/
    const db = getDb();
    const [existing]: any = await db.query(
      "SELECT * FROM transactions WHERE reference = ? LIMIT 1",
      [reference]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        status: true,
        message: "Wallet already credited",
        data: existing[0],
      });
    }

    /* -----------------------------------------
       ✅ 2. VERIFY WITH PAYSTACK
    ------------------------------------------*/
    const res = await fetch(`${PAYSTACK_VERIFY_URL}/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_KEY}`,
      },
    });

    const paystackData = await res.json();

    if (!res.ok || paystackData?.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful", details: paystackData },
        { status: 400 }
      );
    }

    const tx = paystackData.data;

    const amountNaira = tx.amount / 100;
    const email = tx.customer.email;
    const userId = tx.metadata?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in transaction metadata" },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       ✅ 3. CREATE WALLET IF NOT EXISTS
    ------------------------------------------*/
    await db.query(
      "INSERT INTO wallets (userId, balance) VALUES (?, 0) ON DUPLICATE KEY UPDATE userId = userId",
      [userId]
    );

    /* -----------------------------------------
       ✅ 4. CREDIT WALLET
    ------------------------------------------*/
    await db.query(
      "UPDATE users SET WalletBalance = WalletBalance + ? WHERE id = ?",
      [amountNaira, userId]
    );

    /* -----------------------------------------
       ✅ 5. SAVE TRANSACTION
    ------------------------------------------*/
    await db.query(
      `INSERT INTO transactions (reference, email, amount, status, userId, type)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tx.reference,
        email,
        amountNaira,
        tx.status,
        userId,
        "topup",
      ]
    );


    return NextResponse.json({
      status: true,
      message: "Wallet funded successfully",
      amountCredited: amountNaira,
      userId,
      
    });

  } catch (err: any) {
    console.error("VERIFY ERROR:", err);
      return NextResponse.json(
    { error: "Service unavailable. Please try again later." },
    { status: 503 }
  );
  }
}
