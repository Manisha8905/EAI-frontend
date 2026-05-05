import { NextResponse } from "next/server";
import { resolveBackend } from "../../../_lib/backendResolver";

/**
 * GET /api/campaigns/:id/call-history/
 *
 * Server-side proxy that forwards the Authorization header and follows any
 * backend redirects internally (Node.js fetch). This prevents the browser
 * from ever following a cross-origin redirect, which would silently drop
 * the Authorization header and cause a 401.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  const host = request.headers.get("host") || "";
  const backendBase = resolveBackend(host);
  const authorization = request.headers.get("authorization") || "";

  const targetUrl = `${backendBase}/campaigns/${id}/call-history/`;

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      redirect: "follow", // Node.js follows redirects without CORS restrictions
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Upstream proxy error" }, { status: 502 });
  }
}
