import { NextResponse } from "next/server";
import { resolveBackend } from "../../../_lib/backendResolver";

/**
 * GET /api/campaigns/:id/email-stats/
 *
 * Server-side proxy — Node.js follows backend redirects internally so the
 * browser never makes a cross-origin request that would drop the
 * Authorization header and return 401.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  const host = request.headers.get("host") || "";
  const backendBase = resolveBackend(host);
  const authorization = request.headers.get("authorization") || "";

  const targetUrl = `${backendBase}/campaigns/${id}/email-stats/`;

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      redirect: "follow",
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
