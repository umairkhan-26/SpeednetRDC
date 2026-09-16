import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { STAFF_SESSION_COOKIE, verifyStaffSessionToken } from "@/lib/staff/session";
import { routing } from "@/i18n/routing";

const PUBLIC_STAFF_PATHS = new Set(["/staff/login", "/admin/login"]);
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /staff and /admin are internal tools: unlocalized, English-only, and
  // gated by their own session-cookie auth check. They must never pass
  // through next-intl's routing (no locale prefix, no locale redirects).
  if (pathname.startsWith("/staff") || pathname.startsWith("/admin")) {
    if (PUBLIC_STAFF_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const loginPath = isAdminRoute ? "/admin/login" : "/staff/login";

    const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const session = token ? verifyStaffSessionToken(token) : null;

    if (!session) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    if (isAdminRoute && session.role !== "admin") {
      return NextResponse.redirect(new URL("/staff", request.url));
    }

    return NextResponse.next();
  }

  // Still runs for locale-prefix redirect/rewrite decisions (e.g. an
  // unprefixed or wrongly-prefixed URL), and sets a NEXT_LOCALE cookie for
  // "remember the visitor's chosen locale". It does not, however, reliably
  // propagate locale to the page render via request headers in this
  // Next.js version — see [locale]/layout.tsx, which sources locale from
  // params instead for that reason.
  return handleI18nRouting(request);
}

export const config = {
  // A single inclusive matcher, per next-intl's own guidance: keep /staff
  // and /admin included here too, and let the in-function logic above
  // branch and bypass i18n routing for them, rather than trying to union
  // separate path-to-regexp-style entries with this regex-style one.
  //
  // Note: the literal "/" root path does not reliably reach this function
  // in this Next.js version (verified empirically — every other path does,
  // including "/staff"), so next.config.mjs's redirects() handles the root
  // redirect to the default locale independently of this proxy.
  matcher: ["/", "/((?!api|_next|_vercel|icon|apple-icon|setup-admin|.*\\..*).*)"],
};
