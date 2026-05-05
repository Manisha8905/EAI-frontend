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
  // ── Local development ────────────────────────────────────────────────────
  // Point to whichever backend has your Finance / invoice-processing API.
  // Change this URL to match your local or staging backend.
  "localhost": "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com",

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

  // ── DEBUG — remove once confirmed working ────────────────────────────────
  console.log("[proxy] host      :", host);
  console.log("[proxy] backend   :", backendBase);
  console.log("[proxy] targetUrl :", targetUrl);
  // ─────────────────────────────────────────────────────────────────────────

  // Build upstream headers by forwarding most incoming headers.
  const upstreamHeaders = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "content-length" ||
      lower === "connection" ||
      lower === "accept-encoding"
    ) {
      return;
    }
    upstreamHeaders.set(key, value);
  });

  if (!upstreamHeaders.has("accept")) {
    upstreamHeaders.set("Accept", "*/*");
  }

  let body = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body: body || undefined,
      redirect: "follow", // Node.js follows http→https redirects without CORS
    });

    const payload = await res.arrayBuffer();

    console.log("[proxy] upstream status:", res.status, "url:", targetUrl);

    // Propagate response status and key headers so binary downloads remain intact.
    const responseHeaders = new Headers();
    const passThroughHeaders = [
      "content-type",
      "content-disposition",
      "cache-control",
      "expires",
      "pragma",
      "last-modified",
      "etag",
    ];

    passThroughHeaders.forEach((name) => {
      const value = res.headers.get(name);
      if (value) responseHeaders.set(name, value);
    });

    return new Response(payload, {
      status: res.status,
      headers: responseHeaders,
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
