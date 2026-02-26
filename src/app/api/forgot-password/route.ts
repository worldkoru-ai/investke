import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // Get database pool
    const db = await getDb();

    // Find user
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );
    const user = rows[0];

    // Security: always return same message even if user doesn't exist
    if (!user) {
      return NextResponse.json({ message: "If account exists, email sent." });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Set expiry 15 mins
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with token and expiry
    await db.execute(
      "UPDATE users SET resetPasswordToken = ?, resetPasswordExpiry = ? WHERE id = ?",
      [hashedToken, expiry, user.id]
    );

    // Build reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // Send branded reset email
    await sendEmail({
      to: user.email,
      subject: "Reset Your Exovest Password",
      html: `
        <div style="font-family:sans-serif; padding:20px;">
          <h2>Reset Your Password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" 
             style="display:inline-block;padding:10px 20px;
             background:black;color:white;text-decoration:none;
             border-radius:6px;">
             Reset Password
          </a>
          <p style="margin-top:20px;font-size:12px;color:gray;">
            This link expires in 15 minutes.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "If account exists, email sent." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}