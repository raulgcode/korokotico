import { ArrowRightIcon, CheckCircle2Icon, PackageIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Form, useFetcher, useNavigation } from "react-router";
import type { Route } from "./+types/cart";
import { SectionHeading } from "~/components/section-heading";
import { SmartLink } from "~/components/smart-link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { getRequestItems, getShop } from "~/lib/directus.server";
import { checkout, removeFromCart, type CheckoutErrors } from "~/lib/orders.server";
import { rootData, seo } from "~/lib/seo";
import { getCart } from "~/lib/session.server";
import { cn, formatPrice } from "~/lib/utils";

export async function loader({ request }: Route.LoaderArgs) {
  const { items: ids } = await getCart(request);
  const [items, shop] = await Promise.all([getRequestItems(ids), getShop()]);
  const added = new URL(request.url).searchParams.has("agregado");
  return { items, zones: shop.shippingZones, added };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get("intent") === "remove") return removeFromCart(request, Number(form.get("id")));
  const { shippingZones } = await getShop();
  return checkout(request, form, shippingZones);
}

export function meta({ matches }: Route.MetaArgs) {
  return seo(rootData(matches), {
    fallbackTitle: "Tu carrito",
    description: "Revisa tus personajes y envía tu solicitud a Korokotico.",
    path: "/carrito",
    noIndex: true,
  });
}

function RemoveButton({ id }: { id: number }) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="remove" />
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" disabled={fetcher.state !== "idle"} className="text-muted-foreground hover:text-destructive">
        <Trash2Icon /> Quitar
      </Button>
    </fetcher.Form>
  );
}

export default function Cart({ loaderData, actionData }: Route.ComponentProps) {
  const { items, zones, added } = loaderData;
  const errors = ((actionData as { errors?: CheckoutErrors } | undefined)?.errors ?? {}) as CheckoutErrors;
  const [zoneId, setZoneId] = useState("");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting" && navigation.formData?.get("intent") === "checkout";

  const subtotal = items.reduce((s, i) => s + (i.subtotal ?? 0), 0);
  const zone = zones.find((z) => String(z.id) === zoneId);

  return (
    <>
      <section className="border-b-2 border-dashed border-border">
        <div className="container-k py-12 sm:py-16">
          <SectionHeading as="h1" title="Tu carrito" subtitle="El próximo abrazo empieza contigo." />
        </div>
      </section>

      <section className="container-k py-10 sm:py-14">
        {items.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-[2rem] border-2 border-dashed bg-card p-10 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-accent text-primary">
              <ShoppingBagIcon className="size-7" />
            </span>
            <p className="text-lg text-muted-foreground">Todavía no has agregado personajes a tu carrito.</p>
            <Button asChild size="lg">
              <SmartLink to="/colecciones">
                Explorar colecciones <ArrowRightIcon />
              </SmartLink>
            </Button>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
            <div className="space-y-4">
              {added && (
                <p className="flex items-center gap-2 rounded-xl bg-secondary p-4 font-semibold text-secondary-foreground">
                  <CheckCircle2Icon className="size-5" /> ¡Listo! Tu personaje está en el carrito.
                </p>
              )}
              {items.map((item) => (
                <Card key={item.id} className="gap-3 border-2 shadow-none">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">{item.character_name}</CardTitle>
                      <p className="text-sm font-semibold text-primary">{item.collection?.title}</p>
                    </div>
                    <p className="font-display text-xl font-semibold whitespace-nowrap">{formatPrice(item.subtotal)}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                      <PackageIcon className="size-4 text-leaf" />
                      <span className="font-bold text-foreground">{item.package?.name}</span>
                      {!!item.addons?.length && <span>· {item.addons.join(", ")}</span>}
                      <span>· {item.units} {item.units === 1 ? "unidad" : "unidades"}</span>
                    </p>
                    {item.idea && <p className="line-clamp-3 text-muted-foreground">{item.idea}</p>}
                    {!!item.references?.length && (
                      <p className="text-xs text-muted-foreground">📎 {item.references.length} referencia(s) adjunta(s)</p>
                    )}
                    <div className="flex justify-end">
                      <RemoveButton id={item.id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button asChild variant="outline">
                <SmartLink to="/crear">+ Agregar otro personaje</SmartLink>
              </Button>
            </div>

            <Card className="stitch gap-5 border-0 bg-accent/60 shadow-none outline-primary/30 lg:sticky lg:top-28">
              <CardHeader>
                <CardTitle className="text-2xl">Enviar solicitud</CardTitle>
                <p className="text-sm text-muted-foreground">Pagas después de aprobar el diseño. Te escribimos por WhatsApp.</p>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="checkout" />
                  {errors.form && <p className="font-semibold text-destructive">{errors.form}</p>}
                  {(
                    [
                      ["customer_name", "Tu nombre", "text", "name"],
                      ["email", "Correo", "email", "email"],
                      ["phone", "WhatsApp", "tel", "tel"],
                    ] as const
                  ).map(([name, label, type, autoComplete]) => (
                    <div key={name} className="space-y-2">
                      <Label htmlFor={name}>{label}</Label>
                      <Input id={name} name={name} type={type} autoComplete={autoComplete} required aria-invalid={!!errors[name]} />
                      {errors[name] && <p className="text-sm font-semibold text-destructive">{errors[name]}</p>}
                    </div>
                  ))}
                  <fieldset className="space-y-2">
                    <legend className="mb-2 text-sm font-bold">Zona de envío</legend>
                    <RadioGroup name="shipping_zone" value={zoneId} onValueChange={setZoneId} required>
                      {zones.map((z) => (
                        <Label
                          key={z.id}
                          htmlFor={`zone-${z.id}`}
                          className={cn("flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-card px-4 py-3", zoneId === String(z.id) && "border-primary")}
                        >
                          <RadioGroupItem id={`zone-${z.id}`} value={String(z.id)} />
                          <span className="flex-1">{z.name}</span>
                          <span className="font-bold text-muted-foreground">{formatPrice(z.price)}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                    {errors.shipping_zone && <p className="text-sm font-semibold text-destructive">{errors.shipping_zone}</p>}
                  </fieldset>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección de envío</Label>
                    <Textarea id="address" name="address" autoComplete="street-address" required className="min-h-20" aria-invalid={!!errors.address} />
                    {errors.address && <p className="text-sm font-semibold text-destructive">{errors.address}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Textarea id="notes" name="notes" className="min-h-16" />
                  </div>

                  <Separator className="bg-primary/20" />
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd className="font-bold">{formatPrice(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Envío</dt>
                      <dd className="font-bold">{zone ? formatPrice(zone.price) : "—"}</dd>
                    </div>
                    <div className="flex justify-between border-t-2 border-dashed border-primary/25 pt-2 text-base">
                      <dt className="font-bold">Total estimado</dt>
                      <dd className="font-display text-2xl font-semibold text-primary">{formatPrice(subtotal + (zone?.price ?? 0))}</dd>
                    </div>
                  </dl>
                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Enviando…" : "Enviar mi solicitud"}
                  </Button>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </>
  );
}
