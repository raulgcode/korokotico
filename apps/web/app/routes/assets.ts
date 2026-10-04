import type { Route } from "./+types/assets";
import { fetchAsset } from "~/lib/directus.server";

// Sirve las imágenes del CMS desde el mismo dominio (mejor SEO y caché)
export async function loader({ params, request }: Route.LoaderArgs) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response("Not found", { status: 404 });
  const upstream = await fetchAsset(params.id, new URL(request.url).search);
  if (!upstream || !upstream.ok) return new Response("Not found", { status: upstream?.status === 404 || !upstream ? 404 : 502 });

  const headers = new Headers();
  for (const h of ["content-type", "content-length", "etag", "last-modified"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  headers.set("Vary", "Accept");
  if (headers.get("content-type")?.includes("svg")) headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");
  return new Response(upstream.body, { status: 200, headers });
}
