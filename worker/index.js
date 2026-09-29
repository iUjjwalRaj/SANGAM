/**
 * SANGAM — Cloudflare Worker Gateway
 *
 * Deployment Architecture:
 * 1. /api/* -> Proxied to managed FastAPI backend (configured via BACKEND_API_URL)
 * 2. /*     -> Static React SPA assets served via Cloudflare Workers Static Assets (env.ASSETS)
 *              with single-page application fallback to index.html for client-side routing.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API Gateway Proxy for /api/*
    if (url.pathname.startsWith('/api')) {
      const backendBase = env.BACKEND_API_URL;
      if (!backendBase) {
        return new Response(
          JSON.stringify({
            error: "Backend API gateway unconfigured",
            detail: "The environment variable BACKEND_API_URL must point to the managed FastAPI service.",
            system: "SANGAM",
            timestamp: new Date().toISOString()
          }),
          {
            status: 502,
            headers: {
              "Content-Type": "application/json",
              "X-Proxy-By": "SANGAM-Cloudflare-Worker"
            }
          }
        );
      }

      // Reconstruct target upstream URL
      const cleanBase = backendBase.replace(/\/+$/, "");
      const targetUrl = `${cleanBase}${url.pathname}${url.search}`;

      // Forward request headers
      const headers = new Headers(request.headers);
      headers.set("X-Forwarded-Host", url.host);
      headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

      const isBodyAllowed = !['GET', 'HEAD'].includes(request.method.toUpperCase());

      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: headers,
        body: isBodyAllowed ? request.body : undefined,
        redirect: "follow"
      });

      try {
        const response = await fetch(proxyRequest);
        const resHeaders = new Headers(response.headers);
        resHeaders.set("X-Proxied-By", "SANGAM-Cloudflare-Worker");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: resHeaders
        });
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: "Upstream backend unreachable",
            detail: err.message || "Failed to establish connection with managed FastAPI host.",
            target: cleanBase,
            system: "SANGAM",
            timestamp: new Date().toISOString()
          }),
          {
            status: 504,
            headers: {
              "Content-Type": "application/json",
              "X-Proxy-By": "SANGAM-Cloudflare-Worker"
            }
          }
        );
      }
    }

    // Static Assets & React SPA Fallback
    // Cloudflare Workers Static Assets binding (env.ASSETS) serves files from frontend/dist
    // with single-page-application fallback configured in wrangler.jsonc.
    return env.ASSETS.fetch(request);
  }
};
