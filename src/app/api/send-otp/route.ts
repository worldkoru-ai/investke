// pages/api/send-otp.ts
import { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "@/lib/email";

let otpStore: Record<string, { code: string; expires: number }> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email required" });

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore[email] = { code, expires };

  try {
    await sendEmail({
      to: email,
      subject: "Your Exovest OTP Code",
      html: `<p>Your OTP code is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

// Optional: create /api/verify-otp to check OTP
export async function verifyOtp(email: string, code: string) {
  const record = otpStore[email];
  if (!record) return false;
  if (record.expires < Date.now()) {
    delete otpStore[email];
    return false;
  }
  if (record.code !== code) return false;

  delete otpStore[email]; // invalidate OTP after use
  return true;
}