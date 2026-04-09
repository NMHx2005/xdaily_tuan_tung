import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

/** Chỉ dùng config Edge-safe — không import Prisma/bcrypt (xem auth.config.ts). */
const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/admin", "/checkout"];
const authRoutes = ["/account"];
const publicAuthRoutes = ["/account/login", "/account/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute =
    authRoutes.some((route) => pathname.startsWith(route)) &&
    !publicAuthRoutes.some((route) => pathname === route);

  if ((isProtectedRoute || isAuthRoute) && !isLoggedIn) {
    const loginUrl = new URL("/account/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout"],
};
