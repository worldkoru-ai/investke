import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    const userId = result.insertId;
    // const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET || "secretkey", {
    //   expiresIn: "7d",
    // });

    const token = jwt.sign(
  { userId: userId, email },  // ← Change "id" to "userId"
  process.env.JWT_SECRET || "secretkey",
  { expiresIn: "7d" }
);

    const response = NextResponse.json({ message: "Account created successfully" });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Signup route error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
