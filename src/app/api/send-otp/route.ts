import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import mysql from "mysql2/promise";

const resend = new Resend(process.env.RESEND_API_KEY!);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  // Save OTP in MySQL
  await db.execute(
    `INSERT INTO user_otps (email, code, expires_at) VALUES (?, ?, ?)`,
    [email, code, expiresAt]
  );

  // Send OTP via Resend
  try {
    await resend.emails.send({
      from: "Exovest <support@exovest.pro>",
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}