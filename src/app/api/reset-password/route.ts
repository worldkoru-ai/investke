import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Validate input
    if (!token || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Invalid token or password too short (min 6 chars)" },
        { status: 400 }
      );
    }

    // Hash the incoming token to match DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Get DB pool
    const db = await getDb();

    // Find user with matching token and not expired
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpiry > ?",
      [hashedToken, new Date()]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear token
    await db.execute(
      "UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Your Exovest Password Was Changed",
      html: `
        <div style="font-family:sans-serif; padding:20px;">
          <h2>Password Changed Successfully</h2>
          <p>If you did not perform this change, contact support immediately.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}