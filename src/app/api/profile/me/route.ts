import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // ✅ Get userId from cookie/session (or query if you're using that)
    const userId = req.headers.get("x-user-id"); 
    // If you already use /api/me with cookies, tell me — I’ll wire it properly.

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // ✅ Get user
    const [users]: any = await db.query(
      `SELECT id, name, email, walletBalance, totalInvested, totalInterestEarned
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Get verification
    const [verifications]: any = await db.query(
      `SELECT idType, idFrontUrl, idBackUrl, status
       FROM user_verifications WHERE userId = ? LIMIT 1`,
      [userId]
    );

    return NextResponse.json({
      user: users[0],
      verification: verifications[0] || null,
    });

  } catch (err: any) {
    console.error("PROFILE FETCH ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}
