import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const db = getDb();

  const [rows]: any = await db.query(
    `SELECT id, reference, amount, status, created_at 
     FROM transactions WHERE userId = ? ORDER BY id DESC`,
    [userId]
  );

  return NextResponse.json({ transactions: rows });
}
