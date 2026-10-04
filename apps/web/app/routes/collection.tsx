import { ChevronLeftIcon } from "lucide-react";
import { data } from "react-router";
import type { Route } from "./+types/collection";
import { CreateForm } from "~/components/blocks/create-form";
import { CmsImage } from "~/components/cms-image";
import { SmartLink } from "~/components/smart-link";
import { Badge } from "~/components/ui/badge";
import { getCollection, getCollections, getCreateFormBlock, getShop } from "~/lib/directus.server";
import { addToCart } from "~/lib/orders.server";
import { breadcrumbJsonLd, rootData, seo } from "~/lib/seo";

export async function loader({ params }: Route.LoaderArgs) {
  const [collection, collections, shop, form] = await Promise.all([
    getCollection(params.slug),
    getCollections(),
    getShop(),
    getCreateFormBlock(),
  ]);
  if (!collection) throw data("Colección no encontrada", { status: 404 });
  return { collection, collections, shop, form };
}

export async function action({ request }: Route.ActionArgs) {
  return addToCart(request);
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (!loaderData) return [];
  const root = rootData(matches);
  const c = loaderData.collection;
  const path = `/colecciones/${c.slug}`;
  const minPrice = Math.min(...loaderData.shop.packages.map((p) => p.price));
  return seo(root, {
    title: c.seo_title,
    fallbackTitle: c.title,
    description: c.seo_description || c.description,
    image: c.og_image ?? (c.image && c.image.type !== "image/svg+xml" ? c.image : null),
    path,
    type: "product",
    jsonLd: [
      breadcrumbJsonLd(root, [
        { name: "Colecciones", path: "/colecciones" },
        { name: c.title, path },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: c.title,
        description: c.description,
        brand: { "@type": "Brand", name: root?.settings.site_name },
        image: c.image ? `${root?.siteUrl ?? ""}/assets/${c.image.id}` : undefined,
        offers: Number.isFinite(minPrice)
          ? { "@type": "AggregateOffer", priceCurrency: "CRC", lowPrice: minPrice, availability: "https://schema.org/PreOrder" }
          : undefined,
      },
    ],
  });
}

export default function CollectionPage({ loaderData }: Route.ComponentProps) {
  const { collection: c, collections, shop, form } = loaderData;
  return (
    <>
      <section className="relative isolate overflow-hidden border-b-2 border-dashed border-border">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60"
          style={{ background: `radial-gradient(circle at 80% 20%, ${c.accent_color ?? "#f6dccd"}55, transparent 60%)` }}
        />
        <div className="container-k grid items-center gap-10 py-10 sm:py-14 md:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center md:text-left">
            <SmartLink to="/colecciones" className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary">
              <ChevronLeftIcon className="size-4" /> Colecciones
            </SmartLink>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              {c.number && <Badge variant="outline" className="border-2 font-display text-sm">{c.number}</Badge>}
              {c.category && <Badge variant="accent">{c.category}</Badge>}
            </div>
            <h1 className="mt-4 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">{c.title}</h1>
            {c.description && <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{c.description}</p>}
            {c.body && <div className="prose-k mt-6 text-base" dangerouslySetInnerHTML={{ __html: c.body }} />}
          </div>
          <div className="stitch mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2rem] outline-white/80" style={{ backgroundColor: `${c.accent_color ?? "#f6dccd"}33` }}>
            <CmsImage file={c.image} alt={c.title} priority widths={[400, 640, 800]} sizes="(min-width: 768px) 24rem, 90vw" className="size-full object-cover" />
          </div>
        </div>
      </section>
      {form && <CreateForm key={c.id} block={form} collections={collections} shop={shop} defaultCollection={c.id} forceHeading />}
    </>
  );
}
