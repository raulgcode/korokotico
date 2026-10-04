import type { MetaDescriptor } from "react-router";
import type { SiteSettings } from "./types";

export type RootData = { settings: SiteSettings; siteUrl: string };

type SeoInput = {
  title?: string | null;
  /** Título simple de la página; se combina con el nombre del sitio si no hay título SEO */
  fallbackTitle?: string | null;
  description?: string | null;
  image?: { id: string } | string | null;
  path: string;
  noIndex?: boolean | null;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown>[];
};

export function rootData(matches: readonly unknown[]) {
  const root = (matches as ({ id: string; loaderData?: unknown } | undefined)[]).find((m) => m?.id === "root");
  return root?.loaderData as RootData | undefined;
}

/** Todas las etiquetas SEO de una página: title, description, canonical, Open Graph, Twitter y JSON-LD */
export function seo(root: RootData | undefined, input: SeoInput): MetaDescriptor[] {
  const settings = root?.settings;
  const siteName = settings?.site_name ?? "Korokotico";
  const siteUrl = root?.siteUrl ?? "";
  const title =
    input.title || (input.fallbackTitle ? `${input.fallbackTitle} · ${siteName}` : settings?.seo_title || siteName);
  const description = input.description || settings?.seo_description || "";
  const url = `${siteUrl}${input.path === "/" ? "" : input.path}` || "/";
  const imageId = typeof input.image === "string" ? input.image : (input.image?.id ?? settings?.og_image?.id);
  const image = imageId ? `${siteUrl}/assets/${imageId}?width=1200&height=630&fit=cover&format=jpg` : undefined;

  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { name: "robots", content: input.noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large" },
    { property: "og:type", content: input.type === "product" ? "product" : (input.type ?? "website") },
    { property: "og:site_name", content: siteName },
    { property: "og:locale", content: settings?.locale || "es_CR" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    tags.push(
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: title },
      { name: "twitter:image", content: image },
    );
  }
  if (settings?.twitter_handle) tags.push({ name: "twitter:site", content: settings.twitter_handle });
  for (const json of input.jsonLd ?? []) tags.push({ "script:ld+json": json });
  return tags;
}

export function organizationJsonLd(root: RootData | undefined) {
  const s = root?.settings;
  const siteUrl = root?.siteUrl ?? "";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s?.site_name ?? "Korokotico",
    url: siteUrl || undefined,
    logo: s?.logo ? `${siteUrl}/assets/${s.logo.id}` : undefined,
    email: s?.contact_email || undefined,
    sameAs: [s?.instagram_url, s?.facebook_url].filter(Boolean),
    address: { "@type": "PostalAddress", addressCountry: "CR" },
  };
}

export function breadcrumbJsonLd(root: RootData | undefined, crumbs: { name: string; path: string }[]) {
  const siteUrl = root?.siteUrl ?? "";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Inicio", path: "/" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteUrl}${c.path === "/" ? "" : c.path}` || "/",
    })),
  };
}
