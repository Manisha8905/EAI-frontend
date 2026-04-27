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
  const base = (host || "").replace(/:\d+$/, "");
  return HOST_BACKEND_MAP[base] ?? DEFAULT_BACKEND;
}

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
    return NextResponse.json(
      { detail: "Upstream proxy error" },
      { status: 502 }
    );
  }
}
