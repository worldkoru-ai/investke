import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const db = getDb();
    const [users]: any = await db.query(`
      SELECT 
        id, name, email, walletBalance, totalInvested, totalInterestEarned, 
        isAdmin
      FROM users
    `);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}