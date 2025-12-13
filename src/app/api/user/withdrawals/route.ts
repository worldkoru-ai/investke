import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const db = getDb();

  const [rows]: any = await db.query(
    `SELECT id,status, amount, method AS type,created_at AS createdAt 
     FROM withdrawals WHERE userId = ? ORDER BY id DESC`,
    [userId]
  );

  return NextResponse.json({ withdrawals: rows });
}
