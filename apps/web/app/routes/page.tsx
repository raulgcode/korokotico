import { data } from "react-router";
import type { Route } from "./+types/page";
import { BlockRenderer } from "~/components/blocks/block-renderer";
import { getCollections, getDollParts, getPage, getShop } from "~/lib/directus.server";
import { handleCreateAction } from "~/lib/orders.server";
import { breadcrumbJsonLd, organizationJsonLd, rootData, seo } from "~/lib/seo";
import type { CatalogCollection, DollPartType, Shop } from "~/lib/types";

function slugFrom(params: Record<string, string | undefined>) {
  return (params["*"] ?? "").replace(/^\/+|\/+$/g, "") || "inicio";
}

export async function loader({ params }: Route.LoaderArgs) {
  const slug = slugFrom(params);
  // /inicio es la portada: evitamos contenido duplicado
  if (params["*"] === "inicio") throw new Response(null, { status: 301, headers: { Location: "/" } });

  const page = await getPage(slug);
  if (!page) throw data("Página no encontrada", { status: 404 });

  const kinds = new Set((page.blocks ?? []).map((b) => b.collection));
  const needsCollections = kinds.has("block_collections") || kinds.has("block_create_form");
  const hasBuilder = (page.blocks ?? []).some((b) => b.collection === "block_create_form" && b.item?.mode === "creador");
  const [collections, shop, dollParts] = await Promise.all([
    needsCollections ? getCollections() : Promise.resolve([] as CatalogCollection[]),
    kinds.has("block_create_form") ? getShop() : Promise.resolve(null as Shop | null),
    hasBuilder ? getDollParts() : Promise.resolve([] as DollPartType[]),
  ]);

  return data(
    { page, collections, shop, dollParts },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } },
  );
}

export async function action({ request }: Route.ActionArgs) {
  return handleCreateAction(request);
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return { "Cache-Control": loaderHeaders.get("Cache-Control") ?? "no-store" };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (!loaderData) return [];
  const root = rootData(matches);
  const { page } = loaderData;
  const isHome = page.slug === "inicio";
  const path = isHome ? "/" : `/${page.slug}`;
  const jsonLd: Record<string, unknown>[] = isHome
    ? [
        organizationJsonLd(root),
        { "@context": "https://schema.org", "@type": "WebSite", name: root?.settings.site_name, url: root?.siteUrl, inLanguage: "es-CR" },
      ]
    : [breadcrumbJsonLd(root, [{ name: page.title, path }])];

  const faq = page.blocks?.find((b) => b.collection === "block_faq");
  if (faq?.collection === "block_faq" && faq.item.items?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.item.items.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    });
  }
  if (page.slug === "colecciones" && loaderData.collections.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: loaderData.collections.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.title,
        url: `${root?.siteUrl ?? ""}/colecciones/${c.slug}`,
      })),
    });
  }

  return seo(root, {
    title: page.seo_title,
    fallbackTitle: page.title,
    description: page.seo_description,
    image: page.og_image,
    path,
    noIndex: page.no_index,
    jsonLd,
  });
}

export default function CmsPage({ loaderData, matches }: Route.ComponentProps) {
  const root = rootData(matches);
  if (!root) return null;
  return (
    <BlockRenderer
      blocks={loaderData.page.blocks ?? []}
      settings={root.settings}
      collections={loaderData.collections}
      shop={loaderData.shop}
      dollParts={loaderData.dollParts}
    />
  );
}
