import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, getRoleHomePath } from "@/lib/constants";
import type { JwtPayload, UserRole } from "@/lib/types";

const publicPaths = ["/login", "/register", "/payment/success", "/payment/cancel"];
const guestOnlyPaths = ["/login", "/register"];

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isGuestOnly = guestOnlyPaths.some((p) => pathname.startsWith(p));
  const isRoot = pathname === "/";

  if (isRoot) {
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload?.role) {
        return NextResponse.redirect(new URL(getRoleHomePath(payload.role), request.url));
      }
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublic) {
    if (token && isGuestOnly) {
      const payload = decodeJwtPayload(token);
      if (payload?.role) {
        return NextResponse.redirect(new URL(getRoleHomePath(payload.role), request.url));
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.role) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  const role = payload.role as UserRole;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/driver/map", request.url));
  }

  if (pathname.startsWith("/driver") && role !== "USER") {
    return NextResponse.redirect(new URL("/admin/map", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/driver/:path*",
    "/admin/:path*",
    "/payment/:path*",
  ],
};
