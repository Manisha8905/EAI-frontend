import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware is no longer needed for backend proxying — all /api/proxy/*
 * requests are handled by the catch-all Node.js route at
 * app/api/proxy/[...path]/route.js which forwards the Authorization header
 * and follows backend redirects server-side.
 *
 * This file is kept as a no-op passthrough.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
