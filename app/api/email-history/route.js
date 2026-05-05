import { NextResponse } from "next/server";
import { resolveBackend } from "../_lib/backendResolver";

/**
 * GET /api/email-history/?campaign_id=:id
 *
 * Server-side proxy that forwards the Authorization header and follows any
 * backend redirects internally (Node.js fetch). This prevents the browser
 * from ever following a cross-origin redirect, which would silently drop
 * the Authorization header and cause a 401.
 */
export async function GET(request) {
  const host = request.headers.get("host") || "";
  const backendBase = resolveBackend(host);
  const authorization = request.headers.get("authorization") || "";

  // Forward all query params (e.g. campaign_id, page, page_size) as-is
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const targetUrl = `${backendBase}/email-history/${query ? `?${query}` : ""}`;

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
