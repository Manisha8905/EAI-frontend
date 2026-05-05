/**
 * Catch-all server-side proxy  →  /api/proxy/[...path]
 *
 * ALL axiosInstance requests (baseURL="/api/proxy") go through here.
 * Node.js fetch follows backend redirects internally, so the Authorization
 * header is never exposed to the browser on a cross-origin redirect.
 *
 * Tenant routing is defined ONLY here (and in next.config.ts for reference).
 */
import { resolveBackend } from "../../_lib/backendResolver";

// ── Core proxy handler ────────────────────────────────────────────────────────
async function proxyRequest(request, { params }) {
  const { path } = await params;
  const method = (request.method || "GET").toUpperCase();
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

  const rawContentLength = request.headers.get("content-length");
  const hasTransferEncoding = !!request.headers.get("transfer-encoding");
  const hasRequestBody =
    !["GET", "HEAD"].includes(method) &&
    ((rawContentLength && Number(rawContentLength) > 0) || hasTransferEncoding);

  let body = undefined;
  if (hasRequestBody) {
    body = await request.arrayBuffer();
  } else {
    // Some upstreams fail DELETE requests if Content-Type is present with no body.
    upstreamHeaders.delete("content-type");
  }

  try {
    let res;
    try {
      res = await fetch(targetUrl, {
        method,
        headers: upstreamHeaders,
        body: body || undefined,
        redirect: "follow", // Node.js follows http→https redirects without CORS
      });
    } catch (firstErr) {
      // Retry DELETE once without body/content-type to avoid upstream gateway failures.
      if (method === "DELETE") {
        const retryHeaders = new Headers(upstreamHeaders);
        retryHeaders.delete("content-type");
        res = await fetch(targetUrl, {
          method,
          headers: retryHeaders,
          redirect: "follow",
        });
      } else {
        throw firstErr;
      }
    }

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
    return new Response(
      JSON.stringify({
        detail: "Upstream proxy error",
        method,
        target: targetUrl,
        error: err?.message || String(err),
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// ── Export all HTTP methods ───────────────────────────────────────────────────
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
