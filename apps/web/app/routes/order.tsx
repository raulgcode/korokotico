import { CheckCircle2Icon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { data } from "react-router";
import type { Route } from "./+types/order";
import { SmartLink } from "~/components/smart-link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getOrderByToken } from "~/lib/directus.server";
import { rootData, seo } from "~/lib/seo";
import { formatPrice } from "~/lib/utils";

const STATUS: Record<string, string> = {
  nueva: "Recibida",
  en_diseno: "En diseño",
  esperando_pago: "Esperando pago",
  pagada: "Pago verificado",
  en_produccion: "En producción",
  enviada: "Enviada",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

export async function loader({ params }: Route.LoaderArgs) {
  const order = await getOrderByToken(params.token);
  if (!order) throw data("Solicitud no encontrada", { status: 404 });
  return { order };
}

export function headers() {
  return { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
}

export function meta({ matches, loaderData }: Route.MetaArgs) {
  return seo(rootData(matches), {
    fallbackTitle: loaderData ? `Solicitud ${loaderData.order.code}` : "Solicitud",
    path: "/cuenta",
    noIndex: true,
  });
}

export default function OrderPage({ loaderData }: Route.ComponentProps) {
  const { order } = loaderData;
  const [copied, setCopied] = useState(false);

  return (
    <section className="container-k max-w-3xl py-12 sm:py-16">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-leaf">
          <CheckCircle2Icon className="size-8" />
        </span>
        <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">¡Gracias, {order.customer_name.split(" ")[0]}!</h1>
        <p className="mx-auto mt-3 max-w-lg text-lg text-muted-foreground">
          Recibimos tu solicitud. Te escribiremos por WhatsApp para revisar el diseño contigo antes de crear tu personaje.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Badge variant="outline" className="border-2 px-4 py-1.5 font-display text-base">{order.code}</Badge>
          <Badge variant="accent" className="px-4 py-1.5 text-sm">{STATUS[order.status] ?? order.status}</Badge>
        </div>
        <Button
          variant="link"
          className="mt-3"
          onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true))}
        >
          <CopyIcon /> {copied ? "Enlace copiado" : "Copiar mi enlace privado"}
        </Button>
        <p className="text-xs text-muted-foreground">Guarda este enlace para consultar el estado de tu solicitud.</p>
      </div>

      <Card className="mt-10 border-2 shadow-none">
        <CardHeader>
          <CardTitle>Tus personajes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 border-b border-dashed pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-display text-lg font-semibold">{item.character_name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.collection?.title} · {item.package?.name} · {item.units} {item.units === 1 ? "unidad" : "unidades"}
                </p>
              </div>
              <p className="font-bold whitespace-nowrap">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
          <dl className="space-y-1 border-t-2 border-dashed pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-bold">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Envío ({order.shipping_zone?.name})</dt>
              <dd className="font-bold">{formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-bold">Total estimado</dt>
              <dd className="font-display text-2xl font-semibold text-primary">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="mt-10 text-center">
        <Button asChild variant="outline" size="lg">
          <SmartLink to="/como-funciona">¿Qué sigue? Conoce el proceso</SmartLink>
        </Button>
      </div>
    </section>
  );
}
