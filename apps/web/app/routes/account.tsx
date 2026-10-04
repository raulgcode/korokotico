import { SearchIcon } from "lucide-react";
import { data, Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/account";
import { SectionHeading } from "~/components/section-heading";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { findOrder } from "~/lib/directus.server";
import { rootData, seo } from "~/lib/seo";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!code || !email) return data({ error: "Escribe tu código y tu correo." }, { status: 400 });
  const order = await findOrder(code, email);
  if (!order) return data({ error: "No encontramos una solicitud con esos datos." }, { status: 404 });
  return redirect(`/pedido/${order.token}`);
}

export function meta({ matches }: Route.MetaArgs) {
  return seo(rootData(matches), {
    fallbackTitle: "Mi cuenta",
    description: "Accede a tu cuenta Korokotico para consultar el historial y estado de tus solicitudes.",
    path: "/cuenta",
    noIndex: true,
  });
}

export default function Account({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <>
      <section className="border-b-2 border-dashed border-border">
        <div className="container-k py-12 sm:py-16">
          <SectionHeading
            as="h1"
            title="Mi cuenta"
            subtitle="No necesitas una cuenta: consulta el estado de tu solicitud con tu código y tu correo."
          />
        </div>
      </section>
      <section className="container-k py-12">
        <Card className="stitch mx-auto max-w-md border-0 bg-accent/60 shadow-none outline-primary/30">
          <CardContent>
            <Form method="post" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de solicitud</Label>
                <Input id="code" name="code" placeholder="KK-XXXXXX" required className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              {actionData?.error && <p className="text-sm font-semibold text-destructive">{actionData.error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={navigation.state !== "idle"}>
                <SearchIcon /> Consultar mi solicitud
              </Button>
            </Form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
