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

  const res = await fetch(`${API_V1}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message ?? "No se pudo registrar" },
      { status: res.status },
    );
  }

  const loginRes = await fetch(`${API_V1}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    return NextResponse.json(
      { message: "Registro exitoso. Inicia sesión manualmente." },
      { status: 201 },
    );
  }

  const response = NextResponse.json({
    user: loginData.user,
    role: loginData.user.role,
  });

  setAuthCookie(response, loginData.accessToken);
  return response;
}
