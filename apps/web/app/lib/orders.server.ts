import { data, redirect } from "react-router";
import { directus, getReferencesFolder, getShop, uploadFile } from "./directus.server";
import { getCart, sessionStorage } from "./session.server";
import type { ShippingZone } from "./types";

const MAX_FILE = 10 * 1024 * 1024;
const MAX_TOTAL = 20 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export type CreateErrors = Partial<Record<"collection" | "character_name" | "idea" | "package" | "references" | "form", string>>;

const text = (form: FormData, key: string, max = 500) => String(form.get(key) ?? "").trim().slice(0, max);

/** Acción del formulario «crear personaje»: guarda el personaje en Directus y lo agrega al carrito */
export async function addToCart(request: Request) {
  const form = await request.formData();
  const { packages, addons } = await getShop();

  const collection = Number(form.get("collection"));
  const pkg = packages.find((p) => p.id === Number(form.get("package")));
  const chosenAddons = pkg?.includes_addons ? [] : addons.filter((a) => form.getAll("addons").includes(String(a.id)));
  const units = Math.min(Math.max(Number(form.get("units")) || 1, 1), 20);
  const values = {
    character_name: text(form, "character_name", 120),
    colors: text(form, "colors", 200),
    idea: text(form, "idea", 2000),
    interests: text(form, "interests", 300),
  };
  const files = form.getAll("references").filter((f): f is File => f instanceof File && f.size > 0);

  const errors: CreateErrors = {};
  if (!collection) errors.collection = "Elige una colección.";
  if (!values.character_name) errors.character_name = "Cuéntanos cómo se llamará tu personaje.";
  if (!values.idea) errors.idea = "Cuéntanos un poquito de tu idea.";
  if (!pkg) errors.package = "Elige un paquete.";
  if (files.some((f) => !ALLOWED.includes(f.type))) errors.references = "Solo aceptamos JPG, PNG, WEBP o PDF.";
  else if (files.some((f) => f.size > MAX_FILE)) errors.references = "Cada archivo puede pesar máximo 10 MB.";
  else if (files.reduce((s, f) => s + f.size, 0) > MAX_TOTAL) errors.references = "Las referencias suman más de 20 MB.";
  if (Object.keys(errors).length) return data({ errors }, { status: 400 });

  const folder = await getReferencesFolder();
  const uploaded = await Promise.all(files.map((f) => uploadFile(f, folder)));
  const unitPrice = pkg!.price + chosenAddons.reduce((s, a) => s + a.price, 0);

  const item = await directus<{ id: number }>("/items/request_items", {
    method: "POST",
    query: { fields: "id" },
    body: {
      status: "en_carrito",
      collection,
      package: pkg!.id,
      addons: pkg!.includes_addons ? addons.map((a) => a.name) : chosenAddons.map((a) => a.name),
      units,
      unit_price: unitPrice,
      subtotal: unitPrice * units,
      ...values,
      references: { create: uploaded.map((f) => ({ directus_files_id: f.id })) },
    },
  });

  const { session, items } = await getCart(request);
  session.set("items", [...items, item.id]);
  return redirect("/carrito?agregado=1", { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } });
}

export async function removeFromCart(request: Request, id: number) {
  const { session, items } = await getCart(request);
  session.set(
    "items",
    items.filter((i) => i !== id),
  );
  return data({ ok: true }, { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } });
}

export type CheckoutErrors = Partial<Record<"customer_name" | "email" | "phone" | "shipping_zone" | "address" | "form", string>>;

function orderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `KK-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

/** Convierte el carrito en una solicitud */
export async function checkout(request: Request, form: FormData, zones: ShippingZone[]) {
  const { session, items } = await getCart(request);
  const values = {
    customer_name: text(form, "customer_name", 120),
    email: text(form, "email", 160).toLowerCase(),
    phone: text(form, "phone", 40),
    address: text(form, "address", 600),
    notes: text(form, "notes", 1000),
  };
  const zone = zones.find((z) => z.id === Number(form.get("shipping_zone")));

  const errors: CheckoutErrors = {};
  if (!items.length) errors.form = "Tu carrito está vacío.";
  if (!values.customer_name) errors.customer_name = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Escribe un correo válido.";
  if (values.phone.replace(/\D/g, "").length < 8) errors.phone = "Escribe un número de WhatsApp válido.";
  if (!zone) errors.shipping_zone = "Elige la zona de envío.";
  if (!values.address) errors.address = "Escribe la dirección de envío.";
  if (Object.keys(errors).length) return data({ errors }, { status: 400 });

  const cartItems = await directus<{ id: number; subtotal: number }[]>("/items/request_items", {
    query: { "filter[id][_in]": items.join(","), "filter[status][_eq]": "en_carrito", fields: "id,subtotal", limit: -1 },
  });
  if (!cartItems.length) return data({ errors: { form: "Tu carrito está vacío." } as CheckoutErrors }, { status: 400 });

  const subtotal = cartItems.reduce((s, i) => s + (i.subtotal ?? 0), 0);
  const token = crypto.randomUUID();
  await directus("/items/orders", {
    method: "POST",
    body: {
      ...values,
      code: orderCode(),
      token,
      status: "nueva",
      shipping_zone: zone!.id,
      subtotal,
      shipping: zone!.price,
      total: subtotal + zone!.price,
      items: cartItems.map((i) => ({ id: i.id, status: "solicitado" })),
    },
  });

  session.set("items", []);
  return redirect(`/pedido/${token}`, { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } });
}
