import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies } from "@/lib/auth";
import { API_V1 } from "@/lib/constants";

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string,
) {
  const token = await getTokenFromCookies();
  const path = params.path.join("/");
  const url = new URL(`${API_V1}/${path}`);
  url.search = request.nextUrl.search;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      const json = await request.json();
      body = JSON.stringify(json);
    } catch {
      body = undefined;
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  return NextResponse.json(data, { status: response.status });
}

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context.params, "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context.params, "POST");
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context.params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context.params, "DELETE");
}
