// Cliente mínimo para la API REST de Directus (solo servidor).
import { data } from "react-router";
import type {
  Addon,
  Block,
  CatalogCollection,
  Menu,
  Order,
  Package,
  Page,
  RequestItem,
  ShippingZone,
  SiteSettings,
} from "./types";

const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? "http://localhost:8055").replace(/\/$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

export class DirectusError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | undefined>;

function toSearch(query?: Query) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined) params.set(k, String(v));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function directus<T>(
  path: string,
  { query, method = "GET", body }: { query?: Query; method?: string; body?: unknown } = {},
): Promise<T> {
  const isForm = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${DIRECTUS_URL}${path}${toSearch(query)}`, {
      method,
      headers: {
        ...(DIRECTUS_TOKEN ? { authorization: `Bearer ${DIRECTUS_TOKEN}` } : {}),
        ...(body && !isForm ? { "content-type": "application/json" } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch (error) {
    console.error(`[directus] ${method} ${path} no responde`, error);
    throw data("El CMS no está disponible en este momento.", { status: 503 });
  }
  if (!res.ok) {
    const text = await res.text();
    console.error(`[directus] ${method} ${path} → ${res.status} ${text}`);
    throw new DirectusError(res.status, text);
  }
  if (res.status === 204) return undefined as T;
  const json = (await res.json()) as { data: T };
  return json.data;
}

// Caché breve en memoria para lo que se pide en cada página (ajustes y menús)
const cache = new Map<string, { at: number; value: unknown }>();
const TTL = Number(process.env.CMS_CACHE_SECONDS ?? 30) * 1000;

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  const value = await load();
  cache.set(key, { at: Date.now(), value });
  return value;
}

const FILE = "id,type,width,height,title,description";

export function getSettings() {
  return cached("settings", () =>
    directus<SiteSettings>("/items/site_settings", {
      query: { fields: `*,logo.${FILE.replaceAll(",", ",logo.")},symbol.${FILE.replaceAll(",", ",symbol.")},og_image.id` },
    }),
  );
}

export function getMenus() {
  return cached("menus", async () => {
    const menus = await directus<Menu[]>("/items/menus", {
      query: { fields: "key,title,items.label,items.url,items.new_tab,items.sort", "deep[items][_sort]": "sort" },
    });
    return Object.fromEntries(menus.map((m) => [m.key, m.items ?? []])) as Record<string, Menu["items"]>;
  });
}

// Campos de imagen que se expanden dentro de cada bloque
const BLOCK_FIELDS = [
  "id",
  "collection",
  "sort",
  "item.*",
  ...["block_hero", "block_page_header", "block_story"].flatMap((c) => FILE.split(",").map((x) => `item:${c}.image.${x}`)),
].join(",");

export async function getPage(slug: string) {
  const pages = await directus<Page[]>("/items/pages", {
    query: {
      "filter[slug][_eq]": slug,
      "filter[status][_eq]": "published",
      fields: `id,slug,title,seo_title,seo_description,no_index,date_updated,og_image.id,blocks.${BLOCK_FIELDS.replaceAll(",", ",blocks.")}`,
      "deep[blocks][_sort]": "sort",
      limit: 1,
    },
  });
  return pages[0] ?? null;
}

export async function getPageSlugs() {
  return directus<Pick<Page, "slug" | "date_updated" | "no_index">[]>("/items/pages", {
    query: { "filter[status][_eq]": "published", fields: "slug,date_updated,no_index", limit: -1 },
  });
}

const COLLECTION_FIELDS = `id,number,slug,title,category,description,body,accent_color,featured,seo_title,seo_description,og_image.id,image.${FILE.replaceAll(",", ",image.")}`;

export function getCollections() {
  return directus<CatalogCollection[]>("/items/catalog_collections", {
    query: { "filter[status][_eq]": "published", fields: COLLECTION_FIELDS, sort: "sort", limit: -1 },
  });
}

export async function getCollection(slug: string) {
  const items = await directus<CatalogCollection[]>("/items/catalog_collections", {
    query: { "filter[slug][_eq]": slug, "filter[status][_eq]": "published", fields: COLLECTION_FIELDS, limit: 1 },
  });
  return items[0] ?? null;
}

export async function getShop() {
  const [packages, addons, shippingZones] = await Promise.all([
    directus<Package[]>("/items/packages", { query: { sort: "sort", limit: -1 } }),
    directus<Addon[]>("/items/addons", { query: { sort: "sort", limit: -1 } }),
    directus<ShippingZone[]>("/items/shipping_zones", { query: { sort: "sort", limit: -1 } }),
  ]);
  return { packages, addons, shippingZones };
}

/** Bloque del formulario de la página «crear» (lo reutilizan las páginas de colección) */
export async function getCreateFormBlock() {
  const page = await getPage("crear");
  const block = page?.blocks?.find((b) => b.collection === "block_create_form");
  return (block?.item ?? null) as Extract<Block, { collection: "block_create_form" }>["item"] | null;
}

const ITEM_FIELDS =
  "id,status,character_name,colors,interests,idea,units,unit_price,subtotal,addons,collection.title,collection.slug,package.name,package.includes_addons,references.directus_files_id.filename_download";

export function getRequestItems(ids: number[]) {
  if (!ids.length) return Promise.resolve([] as RequestItem[]);
  return directus<RequestItem[]>("/items/request_items", {
    query: { "filter[id][_in]": ids.join(","), "filter[status][_eq]": "en_carrito", fields: ITEM_FIELDS, limit: -1 },
  });
}

export async function getOrderByToken(token: string) {
  const orders = await directus<Order[]>("/items/orders", {
    query: {
      "filter[token][_eq]": token,
      fields: `id,code,status,customer_name,email,phone,address,notes,subtotal,shipping,total,date_created,shipping_zone.name,items.${ITEM_FIELDS.replaceAll(",", ",items.")}`,
      limit: 1,
    },
  });
  return orders[0] ?? null;
}

export async function findOrder(code: string, email: string) {
  const orders = await directus<Pick<Order, "token">[]>("/items/orders", {
    query: { "filter[code][_eq]": code, "filter[email][_eq]": email, fields: "token", limit: 1 },
  });
  return orders[0] ?? null;
}

export async function getReferencesFolder() {
  return cached("references-folder", async () => {
    const folders = await directus<{ id: string }[]>("/folders", {
      query: { "filter[name][_eq]": "Referencias de clientes", fields: "id", limit: 1 },
    });
    return folders[0]?.id ?? null;
  });
}

export async function uploadFile(file: File, folder: string | null) {
  const form = new FormData();
  if (folder) form.append("folder", folder);
  form.append("file", file, file.name);
  return directus<{ id: string }>("/files", { method: "POST", body: form });
}

/** Proxy de imágenes: nunca sirve archivos de la carpeta de referencias privadas */
export async function fetchAsset(id: string, search: string) {
  const isPrivate = await cached(`asset-private:${id}`, async () => {
    const file = await directus<{ folder: string | null }>(`/files/${id}`, { query: { fields: "folder" } }).catch(() => null);
    if (!file) return true;
    return file.folder !== null && file.folder === (await getReferencesFolder());
  });
  if (isPrivate) return null;
  return fetch(`${DIRECTUS_URL}/assets/${id}${search}`, {
    headers: DIRECTUS_TOKEN ? { authorization: `Bearer ${DIRECTUS_TOKEN}` } : {},
  });
}
