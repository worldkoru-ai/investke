import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const protectedRoutes = ["/dashboard", "/invest", "/withdraw", "/deposit"];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if trying to access protected route without token
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Prevent logged-in users from visiting login/register page
  if (token && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")) {
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
  ]
};
