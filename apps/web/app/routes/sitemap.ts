import type { Route } from "./+types/sitemap";
import { getCollections, getPageSlugs, getSettings } from "~/lib/directus.server";

export async function loader({ request }: Route.LoaderArgs) {
  const [pages, collections, settings] = await Promise.all([getPageSlugs(), getCollections(), getSettings()]);
  const base = (process.env.SITE_URL || settings.site_url || new URL(request.url).origin).replace(/\/$/, "");
  const urls = [
    ...pages
      .filter((p) => !p.no_index)
      .map((p) => ({ loc: p.slug === "inicio" ? `${base}/` : `${base}/${p.slug}`, lastmod: p.date_updated, priority: p.slug === "inicio" ? "1.0" : "0.8" })),
    ...collections.map((c) => ({ loc: `${base}/colecciones/${c.slug}`, lastmod: null, priority: "0.7" })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}<priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
