// Aviso por correo de cada solicitud nueva, enviado con la API de Resend (https://resend.com).
// Requiere RESEND_API_KEY (secreto en Fly) y un remitente de un dominio verificado en Resend (ORDER_EMAIL_FROM).
// Los destinatarios se editan en Directus: Ajustes del sitio → Correos que reciben los pedidos.
import { getOrderRecipients } from "./directus.server";
import { deliveryLabel } from "./delivery";
import type { Order } from "./types";
import { formatPrice } from "./utils";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.ORDER_EMAIL_FROM || "Korokotico <pedidos@korokotico.com>";
const SITE_URL = (process.env.SITE_URL ?? "http://localhost:5173").replace(/\/$/, "");
const CMS_URL = (process.env.DIRECTUS_PUBLIC_URL || process.env.DIRECTUS_URL || "http://localhost:8055").replace(/\/$/, "");

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const nl2br = (v: unknown) => esc(v).replace(/\r?\n/g, "<br>");

function row(label: string, value: string) {
  return `<tr><td style="padding:4px 12px 4px 0;color:#6b5a50;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:4px 0">${value}</td></tr>`;
}

export function orderEmail(order: Order) {
  const delivery = deliveryLabel(order.delivery_type);
  const kit = order.delivery_type === "materiales";
  const adminUrl = `${CMS_URL}/admin/content/orders/${order.id}`;

  const items = order.items
    .map((item) => {
      const origin = item.source === "creador" ? "Diseñado en el creador" : (item.collection?.title ?? "");
      const details = [
        row("Origen", esc(origin)),
        row("Paquete", `${esc(item.package?.name)} · ${item.units} ${item.units === 1 ? "unidad" : "unidades"}`),
        item.addons?.length ? row("Complementos", esc(item.addons.join(", "))) : "",
        item.design_parts?.length ? row("Piezas", esc(item.design_parts.map((p) => `${p.type}: ${p.name}`).join(" · "))) : "",
        item.colors ? row("Colores", esc(item.colors)) : "",
        item.interests ? row("Gustos", esc(item.interests)) : "",
        item.idea ? row("Idea", nl2br(item.idea)) : "",
        item.references?.length ? row("Referencias", `${item.references.length} archivo(s) adjunto(s) en el CMS`) : "",
        row("Subtotal", `<strong>${formatPrice(item.subtotal)}</strong>`),
      ].join("");
      const image = item.design_image
        ? `<img src="${SITE_URL}/assets/${esc(item.design_image)}?width=320&quality=80&format=png" alt="" width="160" style="display:block;margin:0 0 8px;border-radius:12px;background:#f6efe6">`
        : "";
      return `<div style="border-top:2px dashed #eadfcf;padding:16px 0">${image}<p style="margin:0 0 6px;font-size:18px;font-weight:bold">${esc(item.character_name)}</p><table style="border-collapse:collapse;font-size:14px">${details}</table></div>`;
    })
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#fbf7f1;font-family:Arial,Helvetica,sans-serif;color:#3b2a22">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <h1 style="font-size:22px;margin:0 0 4px">Nueva solicitud ${esc(order.code)}</h1>
  <p style="margin:0 0 16px;color:#6b5a50">${esc(order.customer_name)} acaba de enviar una solicitud desde la web.</p>
  <p style="margin:0 0 16px;padding:12px 16px;border-radius:12px;font-size:16px;font-weight:bold;background:${kit ? "#fff4d6" : "#e3f3e8"}">
    Entrega: ${esc(delivery)}
  </p>
  <table style="border-collapse:collapse;font-size:14px;margin-bottom:8px">
    ${row("Nombre", esc(order.customer_name))}
    ${row("Correo", `<a href="mailto:${esc(order.email)}">${esc(order.email)}</a>`)}
    ${row("WhatsApp", `<a href="https://wa.me/${esc(order.phone.replace(/\D/g, ""))}">${esc(order.phone)}</a>`)}
    ${row("Zona de envío", esc(order.shipping_zone?.name))}
    ${row("Dirección", nl2br(order.address))}
    ${order.notes ? row("Notas", nl2br(order.notes)) : ""}
  </table>
  ${items}
  <table style="border-collapse:collapse;font-size:14px;border-top:2px dashed #eadfcf;padding-top:12px;width:100%">
    ${row("Subtotal", formatPrice(order.subtotal))}
    ${row("Envío", formatPrice(order.shipping))}
    ${row("Total estimado", `<strong style="font-size:18px">${formatPrice(order.total)}</strong>`)}
  </table>
  <p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="display:inline-block;background:#c8643b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">Abrir la solicitud en el CMS</a></p>
</div></body></html>`;

  const text = [
    `Nueva solicitud ${order.code}`,
    `Entrega: ${delivery}`,
    `Nombre: ${order.customer_name}`,
    `Correo: ${order.email}`,
    `WhatsApp: ${order.phone}`,
    `Zona de envío: ${order.shipping_zone?.name ?? ""}`,
    `Dirección: ${order.address ?? ""}`,
    ...(order.notes ? [`Notas: ${order.notes}`] : []),
    "",
    ...order.items.map((i) => `• ${i.character_name} · ${i.package?.name ?? ""} · ${i.units} u. · ${formatPrice(i.subtotal)}`),
    "",
    `Total estimado: ${formatPrice(order.total)}`,
    `CMS: ${adminUrl}`,
  ].join("\n");

  return { subject: `Nueva solicitud ${order.code} · ${order.customer_name} · ${delivery}`, html, text };
}

/** Avisa a los administradores. Nunca lanza error: si falla, la solicitud ya quedó guardada en el CMS. */
export async function notifyNewOrder(order: Order) {
  try {
    if (!RESEND_API_KEY) {
      console.warn(`[correo] Falta RESEND_API_KEY: no se avisó la solicitud ${order.code}`);
      return;
    }
    const to = await getOrderRecipients();
    if (!to.length) {
      console.warn(`[correo] No hay correos en «Correos que reciben los pedidos»: no se avisó la solicitud ${order.code}`);
      return;
    }
    const { subject, html, text } = orderEmail(order);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
        "idempotency-key": `order-${order.code}`,
      },
      body: JSON.stringify({ from: FROM, to, reply_to: order.email, subject, html, text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) console.error(`[correo] Resend rechazó el aviso de ${order.code} → ${res.status} ${await res.text()}`);
    else console.log(`[correo] Aviso de ${order.code} enviado a ${to.length} destinatario(s)`);
  } catch (error) {
    console.error(`[correo] No se pudo avisar la solicitud ${order.code}`, error);
  }
}
