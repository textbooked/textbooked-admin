import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isLoginRoute = pathname === "/login";
  const isForbiddenRoute = pathname === "/forbidden";

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (isLoginRoute || isForbiddenRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isForbiddenRoute) {
    return NextResponse.next();
  }

  if (isLoginRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
