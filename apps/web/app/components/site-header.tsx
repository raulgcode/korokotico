import { MenuIcon, ShoppingBagIcon, UserRoundIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import type { MenuItem, SiteSettings } from "~/lib/types";
import { cn } from "~/lib/utils";
import { Logo } from "./logo";
import { SmartLink } from "./smart-link";

type Props = { settings: SiteSettings; menu: MenuItem[]; cartCount: number };

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative rounded-full px-4 py-2 text-[15px] font-bold transition-colors hover:text-primary",
    isActive && "text-primary after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary",
  );

export function SiteHeader({ settings, menu, cartCount }: Props) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpen(false);
  }

  return (
    <>
      {settings.topbar_text && (
        <div className="bg-cocoa text-[13px] text-background">
          <p className="container-k flex flex-wrap items-center justify-center gap-x-2 py-2 text-center">
            <span>{settings.topbar_text}</span>
            {settings.topbar_link_url && (
              <SmartLink to={settings.topbar_link_url} className="font-bold text-sun underline-offset-4 hover:underline">
                {settings.topbar_link_label}
              </SmartLink>
            )}
          </p>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="container-k flex h-16 items-center justify-between gap-4 sm:h-20">
          <Logo settings={settings} />

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {menu.map((item) => (
                <li key={item.url}>
                  <SmartLink to={item.url} newTab={item.new_tab} nav className={navClass}>
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
              <SmartLink to="/cuenta" aria-label="Mi cuenta">
                <UserRoundIcon className="size-5" />
              </SmartLink>
            </Button>
            <Button asChild variant="ghost" size="icon" className="relative">
              <SmartLink to="/carrito" aria-label={`Carrito (${cartCount})`}>
                <ShoppingBagIcon className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </SmartLink>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                  <MenuIcon className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="gap-0">
                <SheetHeader className="border-b border-dashed pb-5">
                  <SheetTitle className="sr-only">Menú</SheetTitle>
                  <SheetDescription className="sr-only">Navegación del sitio</SheetDescription>
                  <Logo settings={settings} />
                </SheetHeader>
                <nav aria-label="Móvil" className="flex flex-col p-3">
                  {[...menu, { label: "Mi cuenta", url: "/cuenta" }, { label: "Carrito", url: "/carrito" }].map((item) => (
                    <SmartLink
                      key={item.url}
                      to={item.url}
                      nav
                      className={({ isActive }) =>
                        cn(
                          "rounded-xl px-4 py-3.5 font-display text-xl font-semibold transition-colors hover:bg-accent",
                          isActive && "bg-accent text-primary",
                        )
                      }
                    >
                      {item.label}
                    </SmartLink>
                  ))}
                </nav>
                <div className="mt-auto p-5">
                  <Button asChild size="lg" className="w-full">
                    <SmartLink to="/crear">Crear mi personaje</SmartLink>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
