import type { Route } from "./+types/robots";

export function loader({ request }: Route.LoaderArgs) {
  const base = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const body = `User-agent: *
Allow: /
Disallow: /carrito
Disallow: /cuenta
Disallow: /pedido/

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
