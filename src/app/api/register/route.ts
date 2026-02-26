import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getDb();

    console.log("Checking if user exists...");
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    console.log("Existing users:", existing);

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const [result]: any = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    console.log("User inserted:", result);

    // ✅ Just return success - NO token, NO cookie
    return NextResponse.json({ 
      message: "Account created successfully. Please login." 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Signup route error:", error);
      return NextResponse.json(
    { error: "Service unavailable. Please try again later." },
    { status: 503 }
  );
  }
}