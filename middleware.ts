import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  // Protected routes
  if (!token && (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/Invest") ||
    pathname.startsWith("/withdraw") ||
    pathname.startsWith("/deposit")
  )) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Prevent logged-in users from visiting login/signup
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/Invest/:path*",
    "/withdraw/:path*",
    "/deposit/:path*",
    "/login",
    "/signup",
  ],
};