import { NextResponse } from "next/server";

// Keep in sync with next.config.ts rewrites
const HOST_BACKEND_MAP = {
  "campaign-management-1.technologymindz.com":
    "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com",
  "campaign-management-2.technologymindz.com":
    "https://demo-api.technologymindz.net",
  "demo.technologymindz.net": "https://demo-api.technologymindz.net",
  "architessa.technologymindz.net": "https://architessa-api.technologymindz.net",
  "channelbeacon.technologymindz.net":
    "https://channelbeacon-api.technologymindz.net",
  "digiconvo.technologymindz.net": "https://digiconvo-api.technologymindz.net",
  "channelbeacon-11labs-agent1.technologymindz.com":
    "https://channelbeacon-11labs-agent2.technologymindz.com",
  "fms-aisdr-agent1.technologymindz.com":
    "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com",
};

const DEFAULT_BACKEND =
  "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com";

function resolveBackend(host) {
  const base = (host || "").replace(/:\d+$/, ""); // strip port
  return HOST_BACKEND_MAP[base] ?? DEFAULT_BACKEND;
}

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
    return NextResponse.json(
      { detail: "Upstream proxy error" },
      { status: 502 }
    );
  }
}
