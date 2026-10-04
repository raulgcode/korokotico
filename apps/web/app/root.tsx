import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import { ArrowRightIcon } from "lucide-react";

import type { Route } from "./+types/root";
import "./app.css";
import { SiteFooter } from "~/components/site-footer";
import { SiteHeader } from "~/components/site-header";
import { Button } from "~/components/ui/button";
import { SmartLink } from "~/components/smart-link";
import { assetUrl } from "~/lib/assets";
import { getMenus, getSettings } from "~/lib/directus.server";
import { seo, type RootData } from "~/lib/seo";
import { getCart } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const [settings, menus, cart] = await Promise.all([getSettings(), getMenus(), getCart(request)]);
  const siteUrl = (process.env.SITE_URL || settings.site_url || new URL(request.url).origin).replace(/\/$/, "");
  return { settings, menus, cartCount: cart.items.length, siteUrl };
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Nunito:wght@400;600;700;800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const icon = data?.settings.symbol;
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fbf5ec" />
        <meta name="format-detection" content="telephone=no" />
        {icon && <link rel="icon" href={assetUrl(icon, { width: 64 })} type={icon.type ?? undefined} />}
        {icon && <link rel="apple-touch-icon" href={assetUrl(icon, { width: 180 })} />}
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-dvh flex-col">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  if (!data) return <main className="flex-1">{children}</main>;
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-full focus:bg-card focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <SiteHeader settings={data.settings} menu={data.menus.header ?? []} cartCount={data.cartCount} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={data.settings} menu={data.menus.footer ?? []} />
    </>
  );
}

export default function App() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

export function meta({ loaderData, error }: Route.MetaArgs) {
  if (!error) return [];
  const root: RootData | undefined = loaderData ? { settings: loaderData.settings, siteUrl: loaderData.siteUrl } : undefined;
  return seo(root, { fallbackTitle: "Página no encontrada", path: "/404", noIndex: true });
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Algo se descosió";
  let details = "Ocurrió un error inesperado. Intenta de nuevo en un momento.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "No encontramos esta página";
      details = "Puede que el enlace haya cambiado. Te invitamos a seguir explorando.";
    } else if (error.status === 503) {
      details = typeof error.data === "string" ? error.data : details;
    }
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Shell>
      <section className="container-k py-24 text-center">
        <p className="font-display text-7xl font-semibold text-primary">
          {isRouteErrorResponse(error) ? error.status : "¡Ups!"}
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">{details}</p>
        <Button asChild size="lg" className="mt-8">
          <SmartLink to="/">
            Volver al inicio <ArrowRightIcon />
          </SmartLink>
        </Button>
        {stack && (
          <pre className="mt-10 overflow-x-auto rounded-xl bg-muted p-4 text-left text-xs">
            <code>{stack}</code>
          </pre>
        )}
      </section>
    </Shell>
  );
}
