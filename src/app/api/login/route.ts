import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const db = getDb();

    // Find user by email
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name,  walletBalance: user.walletBalance },
      process.env.JWT_SECRET || "secretkey",
    );

    // Set cookie
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  }catch (error: any) {
  // Log full error on server for debugging
  console.error("Login error:", error);

  // Return a safe, generic message to the client
  return NextResponse.json(
    { error: "Service unavailable. Please try again later." },
    { status: 503 }
  );
}
}
