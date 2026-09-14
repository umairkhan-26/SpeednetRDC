import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STAFF_SESSION_COOKIE, verifyStaffSessionToken } from "@/lib/staff/session";

const PUBLIC_STAFF_PATHS = new Set(["/staff/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_STAFF_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
  const session = token ? verifyStaffSessionToken(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/staff", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/admin/:path*"],
};
