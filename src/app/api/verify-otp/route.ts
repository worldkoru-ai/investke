import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ valid: false, error: "Email and OTP required" }, { status: 400 });

  const [rows] = await db.execute(
    `SELECT * FROM user_otps WHERE email = ? AND code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
    [email, code]
  );

  const result: any[] = rows as any[];
  if (!result.length) return NextResponse.json({ valid: false, error: "Invalid or expired OTP" }, { status: 400 });

  // Delete OTP after verification
  await db.execute(`DELETE FROM user_otps WHERE id = ?`, [result[0].id]);

  return NextResponse.json({ valid: true });
}