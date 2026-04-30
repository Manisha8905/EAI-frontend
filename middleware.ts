import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: for all /backend/* requests, forward X-Forwarded-Proto and
 * X-Forwarded-Host so the upstream Django backend knows the original request
 * came over HTTPS from the correct host.
 *
 * Without these headers Django sees the internal Next.js → backend request as
 * plain HTTP and issues an absolute `https://…` redirect back to the browser.
 * The browser then follows that redirect directly to the backend domain, which
 * is cross-origin from localhost:3000. Browsers silently drop the Authorization
 * header on cross-origin redirects, so the backend receives no credentials and
 * returns 401 — even though the original request had a valid Bearer token.
 */
export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/backend")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  // Tell Django the original scheme was HTTPS so it won't emit an http→https
  // redirect that the browser would follow cross-origin.
  requestHeaders.set("X-Forwarded-Proto", "https");

  // Tell Django the real public hostname so any redirects it builds are
  // relative to the correct host (not the internal Next.js server hostname).
  const host = request.headers.get("host") || request.nextUrl.host;
  requestHeaders.set("X-Forwarded-Host", host);

  // Prefer an incoming Authorization header from the browser (axiosInstance sets it),
  // otherwise fall back to session_token cookie.
  const incomingAuth = request.headers.get("authorization");
  if (incomingAuth) {
    requestHeaders.set("Authorization", incomingAuth);
    console.log("🔐 [Middleware] Forwarding incoming Authorization header");
  } else {
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionTokenMatch = cookieHeader.match(/session_token=([^;]+)/);
    const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : null;
    if (sessionToken) {
      requestHeaders.set("Authorization", `Bearer ${sessionToken}`);
      requestHeaders.set("X-Session-Token", sessionToken);
      console.log("🔐 [Middleware] session_token from cookie forwarded in Authorization header");
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/backend/:path*"],
};
