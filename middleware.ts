import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/admin/guard";

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

  const allowlisted = isAdminEmail(typeof token.email === "string" ? token.email : undefined);

  if (!allowlisted) {
    const response = isForbiddenRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/forbidden", request.url));
    clearAuthCookies(response, request);
    return response;
  }

  if (isLoginRoute || isForbiddenRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

function clearAuthCookies(response: NextResponse, request: NextRequest): void {
  const prefixes = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
  ];

  const dynamicNames = request.cookies
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => prefixes.some((prefix) => name === prefix || name.startsWith(`${prefix}.`)));

  const names = new Set([...prefixes, ...dynamicNames]);

  for (const name of names) {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
    });
  }
}
