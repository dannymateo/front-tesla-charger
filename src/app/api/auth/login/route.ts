import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";
import { API_V1 } from "@/lib/constants";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API_V1}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message ?? "Credenciales inválidas" },
      { status: res.status },
    );
  }

  const response = NextResponse.json({
    user: data.user,
    role: data.user.role,
  });

  setAuthCookie(response, data.accessToken);
  return response;
}
