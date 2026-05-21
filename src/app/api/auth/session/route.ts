import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { backendFetch } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { data: user, status } = await backendFetch("/me", {
    token: session.token,
  });

  if (status >= 400) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
    role: session.payload.role,
    token: session.token,
  });
}
