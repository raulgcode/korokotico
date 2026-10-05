// Prepara Directus para Korokotico:
//   1. crea colecciones, campos y relaciones (idempotente)
//   2. configura permisos (lectura pública + usuario "Sitio web" con token)
//   3. carga el contenido inicial si todavía no hay páginas
//
// Uso:  DIRECTUS_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... WEBSITE_TOKEN=... pnpm cms:seed
//       Agrega --force-content para volver a cargar el contenido (borra páginas, menús y colecciones).
//       Agrega --demo-parts para subir piezas de prueba al creador de muñecos (solo desarrollo).

import { readFile } from "node:fs/promises";
import { COLLECTIONS, RELATIONS, FILE_RELATIONS, PUBLIC_READ } from "./schema.mjs";
import * as content from "./content.mjs";
import { collectionSvgs } from "./assets.mjs";
import { DEFAULT_THEMES } from "./themes.mjs";
import * as doll from "./doll.mjs";

const URL_ = (process.env.DIRECTUS_URL ?? "http://localhost:8055").replace(/\/$/, "");
const SITE_URL = (process.env.SITE_URL ?? "http://localhost:5173").replace(/\/$/, "");
const { ADMIN_EMAIL, ADMIN_PASSWORD, WEBSITE_TOKEN } = process.env;
const FORCE = process.argv.includes("--force-content");
const DEMO_PARTS = process.argv.includes("--demo-parts");

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !WEBSITE_TOKEN) {
  console.error("Faltan variables: ADMIN_EMAIL, ADMIN_PASSWORD y WEBSITE_TOKEN son obligatorias.");
  process.exit(1);
}

let token;

async function api(method, path, body, { allow404 = false } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(`${URL_}${path}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body && !isForm ? { "content-type": "application/json" } : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (allow404 && (res.status === 404 || res.status === 403)) return null;
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.data;
}

const log = (...a) => console.log("•", ...a);

async function login() {
  const data = await api("POST", "/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  token = data.access_token;
}

async function ensureSchema() {
  const existing = new Set((await api("GET", "/collections?limit=-1")).map((c) => c.collection));

  for (const c of COLLECTIONS) {
    const meta = {
      icon: c.icon,
      note: null,
      hidden: c.hidden ?? false,
      singleton: c.singleton ?? false,
      group: c.group ?? null,
      sort: c.sort ?? null,
      collapse: c.collapse ?? "open",
      display_template: c.template ?? null,
      sort_field: c.sortField ?? null,
      archive_field: c.archive ? "status" : null,
      archive_value: c.archive ? "draft" : null,
      unarchive_value: c.archive ? "published" : null,
      translations: [{ language: "es-ES", translation: c.label, singular: c.label, plural: c.label }],
    };

    if (!existing.has(c.collection)) {
      log("Creando colección", c.collection);
      await api("POST", "/collections", {
        collection: c.collection,
        meta,
        schema: c.folder ? null : {},
        fields: c.folder ? undefined : c.fields,
      });
      continue;
    }

    await api("PATCH", `/collections/${c.collection}`, { meta });
    if (c.folder) continue;

    const fields = new Map((await api("GET", `/fields/${c.collection}`)).map((fl) => [fl.field, fl]));
    for (const fl of c.fields) {
      const current = fields.get(fl.field);
      if (current) {
        if (fl.field === "id") continue;
        // Entero → decimal se cambia en el lugar (conserva los datos); nunca se borra un campo
        const widen = current.type === "integer" && fl.type === "float";
        if (widen) log("Cambiando a decimal", `${c.collection}.${fl.field}`);
        await api("PATCH", `/fields/${c.collection}/${fl.field}`, widen ? { type: fl.type, schema: {}, meta: fl.meta } : { meta: fl.meta });
      } else {
        log("Agregando campo", `${c.collection}.${fl.field}`);
        await api("POST", `/fields/${c.collection}`, fl);
      }
    }
  }

  for (const r of [...RELATIONS, ...FILE_RELATIONS]) {
    const found = await api("GET", `/relations/${r.collection}/${r.field}`, undefined, { allow404: true });
    if (!found) {
      log("Creando relación", `${r.collection}.${r.field}`);
      await api("POST", "/relations", r);
    } else if (r.meta) {
      await api("PATCH", `/relations/${r.collection}/${r.field}`, { meta: r.meta });
    }
  }
}

async function ensureFolder(name) {
  const found = await api("GET", `/folders?filter[name][_eq]=${encodeURIComponent(name)}`);
  if (found.length) return found[0].id;
  return (await api("POST", "/folders", { name })).id;
}

async function ensurePermission(policy, collection, action, extra = {}) {
  const found = await api(
    "GET",
    `/permissions?filter[policy][_eq]=${policy}&filter[collection][_eq]=${collection}&filter[action][_eq]=${action}`,
  );
  const body = { policy, collection, action, fields: ["*"], permissions: null, validation: null, ...extra };
  if (found.length) await api("PATCH", `/permissions/${found[0].id}`, body);
  else await api("POST", "/permissions", body);
}

async function ensurePermissions() {
  const policies = await api("GET", "/policies?limit=-1");
  const publicPolicy = policies.find((p) => p.name === "$t:public_label");
  if (!publicPolicy) throw new Error("No se encontró la política pública");

  // Directus sin licencia no permite reglas con filtros: la web filtra por
  // status=published y sirve las imágenes a través de su propia ruta /assets,
  // así las referencias privadas de los clientes nunca quedan públicas.
  const readRules = (policy) => PUBLIC_READ.map((collection) => ensurePermission(policy, collection, "read"));

  log("Permisos públicos");
  await Promise.all(readRules(publicPolicy.id));

  // Política y usuario para la web (guarda solicitudes)
  let website = policies.find((p) => p.name === "Sitio web");
  if (!website) {
    website = await api("POST", "/policies", {
      name: "Sitio web",
      icon: "language",
      description: "Usado por la web para leer contenido y guardar solicitudes",
      app_access: false,
      admin_access: false,
    });
  }
  log("Permisos del usuario Sitio web");
  await Promise.all([
    ...readRules(website.id),
    ...["orders", "request_items", "request_items_files"].flatMap((c) =>
      ["create", "read", "update"].map((a) => ensurePermission(website.id, c, a)),
    ),
    ensurePermission(website.id, "directus_files", "create"),
    ensurePermission(website.id, "directus_files", "read"),
    ensurePermission(website.id, "directus_folders", "read"),
  ]);

  let role = (await api("GET", "/roles?filter[name][_eq]=Sitio%20web"))[0];
  if (!role) {
    role = await api("POST", "/roles", { name: "Sitio web", icon: "language", policies: { create: [{ policy: website.id }] } });
  }
  const email = "sitio-web@korokotico.com";
  const user = (await api("GET", `/users?filter[email][_eq]=${encodeURIComponent(email)}`))[0];
  if (user) await api("PATCH", `/users/${user.id}`, { token: WEBSITE_TOKEN, role: role.id });
  else await api("POST", "/users", { email, first_name: "Sitio", last_name: "web", role: role.id, token: WEBSITE_TOKEN, status: "active" });
}

async function upload(name, svg, folder, type = "image/svg+xml") {
  const existing = await api("GET", `/files?filter[filename_download][_eq]=${encodeURIComponent(name)}`);
  if (existing.length) return existing[0].id;
  const form = new FormData();
  form.append("folder", folder);
  form.append("title", name.replace(/\.\w+$/, ""));
  form.append("file", new Blob([svg], { type }), name);
  return (await api("POST", "/files", form)).id;
}

// Logo y símbolo del manual de marca (apps/cms/scripts/brand). Luego se cambian desde el CMS.
const BRAND = { logo: "korokotico-marca-logo.svg", symbol: "korokotico-marca-simbolo.svg" };
const brandSvg = (name) => readFile(new URL(`./brand/${name}`, import.meta.url));

async function uploadBrand(folders) {
  return {
    logo: await upload(BRAND.logo, await brandSvg(BRAND.logo), folders.brand),
    symbol: await upload(BRAND.symbol, await brandSvg(BRAND.symbol), folders.brand),
  };
}

/**
 * Instalaciones anteriores usaban un logo y un perezoso generados. Si siguen puestos, se cambian
 * por los del manual de marca. Si alguien ya eligió otra imagen en el CMS, no se toca.
 */
async function upgradeBrand(folders) {
  const old = {};
  for (const [key, name] of [["logo", "korokotico-logo.svg"], ["symbol", "korokotico-simbolo.svg"]]) {
    old[key] = (await api("GET", `/files?filter[filename_download][_eq]=${name}&fields=id`))[0]?.id;
  }
  if (!old.logo && !old.symbol) return;
  const brand = await uploadBrand(folders);
  const settings = await api("GET", "/items/site_settings?fields=logo,symbol");
  const patch = {};
  for (const key of ["logo", "symbol"]) if (old[key] && settings?.[key] === old[key]) patch[key] = brand[key];
  if (Object.keys(patch).length) {
    log("Ajustes del sitio: logo y símbolo del manual de marca");
    await api("PATCH", "/items/site_settings", patch);
  }
  if (!old.symbol) return;
  for (const c of ["block_hero", "block_page_header", "block_story"]) {
    const ids = (await api("GET", `/items/${c}?filter[image][_eq]=${old.symbol}&fields=id&limit=-1`)).map((i) => i.id);
    if (ids.length) {
      log(`${c}: ${ids.length} imagen(es) cambiadas al símbolo del manual`);
      await api("PATCH", `/items/${c}`, { keys: ids, data: { image: brand.symbol } });
    }
  }
}

async function seedContent(folders) {
  const pageCount = (await api("GET", "/items/pages?aggregate[count]=*"))[0].count;
  if (Number(pageCount) > 0 && !FORCE) {
    log("Ya hay contenido; no se toca (usa --force-content para recargarlo)");
    return;
  }

  if (FORCE) {
    log("Borrando contenido anterior");
    for (const c of ["pages", "menus", "catalog_collections", "packages", "addons", "shipping_zones"]) {
      const ids = (await api("GET", `/items/${c}?fields=id&limit=-1`)).map((i) => i.id);
      if (ids.length) await api("DELETE", `/items/${c}`, ids);
    }
  }

  log("Subiendo imágenes");
  const files = {
    ...(await uploadBrand(folders)),
    og: await upload("korokotico-og.png", await readFile(new URL("./og.png", import.meta.url)), folders.brand, "image/png"),
  };
  for (const [slug, svg] of Object.entries(collectionSvgs)) {
    files[`collection_${slug}`] = await upload(`coleccion-${slug}.svg`, svg, folders.collections);
  }

  log("Ajustes, menús, colecciones y precios");
  await api("PATCH", "/items/site_settings", content.settings(files, URL_, SITE_URL));
  await api("POST", "/items/menus", content.menus(URL_));
  await api("POST", "/items/catalog_collections", content.collections(files));
  await api("POST", "/items/packages", content.packages);
  await api("POST", "/items/addons", content.addons);
  await api("POST", "/items/shipping_zones", content.shippingZones);

  log("Páginas");
  for (const page of content.pages(files)) {
    await api("POST", "/items/pages", {
      status: "published",
      ...page,
      blocks: page.blocks.map((blk, i) => ({ collection: blk.collection, item: blk.item, sort: i + 1 })),
    });
  }
}

/** Crea los temas de fábrica si no hay ninguno y deja uno activo */
async function ensureThemes() {
  let themes = await api("GET", "/items/themes?fields=id,key&limit=-1");
  if (!themes.length) {
    log("Temas: Clásico y Marca 2026");
    themes = await api("POST", "/items/themes?fields=id,key", DEFAULT_THEMES);
  }
  const settings = await api("GET", "/items/site_settings?fields=active_theme");
  if (!settings?.active_theme) {
    const active = themes.find((t) => t.key === "marca") ?? themes[0];
    log("Tema activo:", active.key ?? active.id);
    await api("PATCH", "/items/site_settings", { active_theme: active.id });
  }
}

/** Agrega «Diseña tu muñeco» al menú principal si no está (solo cuando el seed crea o publica la página) */
async function addMenuLink() {
  const menu = (await api("GET", "/items/menus?filter[key][_eq]=header&fields=id,items.url,items.sort"))[0];
  if (!menu || menu.items.some((i) => i.url === `/${doll.PAGE_SLUG}`)) return;
  log("Menú principal: Diseña tu muñeco");
  const sort = Math.max(0, ...menu.items.map((i) => i.sort ?? 0)) + 1;
  await api("POST", "/items/menu_items", { menu: menu.id, label: doll.builderPage.title, url: `/${doll.PAGE_SLUG}`, sort });
}

/**
 * Creador de muñecos: tipos de pieza de fábrica y su página publicada (sin piezas muestra un aviso).
 * No toca nada que ya exista, así que se puede correr en producción.
 */
async function ensureDollBuilder(folders) {
  let types = await api("GET", "/items/doll_part_types?fields=id,name&limit=-1");
  if (!types.length) {
    log("Creador de muñecos: tipos de pieza");
    types = await api("POST", "/items/doll_part_types?fields=id,name", doll.partTypes);
  }

  const page = (await api("GET", `/items/pages?filter[slug][_eq]=${doll.PAGE_SLUG}&fields=id,status,date_updated`))[0];
  if (!page) {
    log(`Creador de muñecos: página /${doll.PAGE_SLUG}`);
    await api("POST", "/items/pages", {
      status: "published",
      ...doll.builderPage,
      blocks: [{ collection: "block_create_form", item: doll.builderBlock, sort: 1 }],
    });
    await addMenuLink();
  } else if (page.status !== "published" && !page.date_updated) {
    // Versiones anteriores del seed la creaban en borrador; si nadie la ha tocado, se publica.
    log(`Creador de muñecos: publicando /${doll.PAGE_SLUG}`);
    await api("PATCH", `/items/pages/${page.id}`, { status: "published" });
    await addMenuLink();
  }

  if (!DEMO_PARTS) return;
  const count = (await api("GET", "/items/doll_parts?aggregate[count]=*"))[0].count;
  if (Number(count) > 0) return;
  log("Creador de muñecos: piezas de prueba");
  const typeId = Object.fromEntries(types.map((t) => [t.name, t.id]));
  const parts = [];
  for (const [i, [type, name, svg, price, isDefault]] of doll.demoParts.entries()) {
    const slug = `${type}-${name}`.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-");
    const image = await upload(`pieza-${slug}.svg`, svg, folders.parts);
    parts.push({ status: "published", sort: i + 1, type: typeId[type], name, image, price, is_default: isDefault });
  }
  await api("POST", "/items/doll_parts", parts);
}

async function projectSettings() {
  await api("PATCH", "/settings", {
    project_name: "Korokotico",
    project_color: "#C8643B",
    default_language: "es-ES",
    project_descriptor: "Panel de contenido",
  });
  const me = await api("GET", "/users/me?fields=id");
  await api("PATCH", `/users/${me.id}`, { language: "es-ES" });
}

await login();
log(`Conectado a ${URL_}`);
await ensureSchema();
const folders = {
  brand: await ensureFolder("Marca"),
  collections: await ensureFolder("Colecciones"),
  references: await ensureFolder("Referencias de clientes"),
  parts: await ensureFolder("Piezas del creador"),
  designs: await ensureFolder("Diseños de clientes"),
};
await ensurePermissions();
await projectSettings();
await seedContent(folders);
await upgradeBrand(folders);
await ensureThemes();
await ensureDollBuilder(folders);
log("Listo ✔");
