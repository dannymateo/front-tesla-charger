import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./constants";
import type { JwtPayload } from "./types";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value;
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as JWTPayload & JwtPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{
  token: string;
  payload: JwtPayload;
} | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return { token, payload };
}

