/**
 * Catch-all server-side proxy  →  /api/proxy/[...path]
 *
 * ALL axiosInstance requests (baseURL="/api/proxy") go through here.
 * Node.js fetch follows backend redirects internally, so the Authorization
 * header is never exposed to the browser on a cross-origin redirect.
 *
 * Tenant routing is defined ONLY here (and in next.config.ts for reference).
 */

// ── Tenant map ────────────────────────────────────────────────────────────────
const HOST_BACKEND_MAP = {
  "campaign-management-1.technologymindz.com":
    "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com",
  "campaign-management-2.technologymindz.com":
    "https://demo-api.technologymindz.net",
  "demo.technologymindz.net": "https://demo-api.technologymindz.net",
  "architessa.technologymindz.net":
    "https://architessa-api.technologymindz.net",
  "channelbeacon.technologymindz.net":
    "https://channelbeacon-api.technologymindz.net",
  "digiconvo.technologymindz.net": "https://digiconvo-api.technologymindz.net",
  "channelbeacon-11labs-agent1.technologymindz.com":
    "https://channelbeacon-11labs-agent2.technologymindz.com",
  "fms-aisdr-agent1.technologymindz.com":
    "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com",
  "hr-tm.technologymindz.net": "https://hr-tm-api.technologymindz.net",
};

const DEFAULT_BACKEND =
  "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com";

function resolveBackend(host) {
  const base = (host || "").replace(/:\d+$/, ""); // strip port
  return HOST_BACKEND_MAP[base] ?? DEFAULT_BACKEND;
}

// ── Core proxy handler ────────────────────────────────────────────────────────
async function proxyRequest(request, { params }) {
  const { path } = await params;
  const host = request.headers.get("host") || "";
  const backendBase = resolveBackend(host);

  // Re-assemble path segments + query string
  const upstreamPath = "/" + path.join("/");
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const targetUrl = `${backendBase}${upstreamPath}${query ? `?${query}` : ""}`;

  // Forward Authorization from incoming request (set by axiosInstance interceptor)
  const authorization = request.headers.get("authorization") || "";

  // Forward Content-Type for POST/PATCH/PUT
  const contentType = request.headers.get("content-type") || "application/json";

  let body = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.text();
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": contentType,
        Accept: "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      body: body || undefined,
      redirect: "follow", // Node.js follows http→https redirects without CORS
    });

    const text = await res.text();

    // Propagate the exact status so the client sees 401, 403, 404, etc.
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[proxy] upstream error:", err);
    return new Response(JSON.stringify({ detail: "Upstream proxy error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ── Export all HTTP methods ───────────────────────────────────────────────────
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
