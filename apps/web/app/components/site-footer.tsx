import { HeartIcon } from "lucide-react";
import type { MenuItem, SiteSettings } from "~/lib/types";
import { Logo } from "./logo";
import { SmartLink } from "./smart-link";

export function SiteFooter({ settings, menu }: { settings: SiteSettings; menu: MenuItem[] }) {
  return (
    <footer className="mt-auto border-t-2 border-dashed border-border bg-muted/60">
      <div className="container-k flex flex-col items-center gap-6 py-12 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo settings={settings} />
          {settings.footer_text && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <HeartIcon className="size-3.5 fill-primary text-primary" aria-hidden />
              {settings.footer_text}
            </p>
          )}
        </div>
        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold">
            {menu.map((item) => (
              <li key={item.url}>
                <SmartLink to={item.url} newTab={item.new_tab} className="hover:text-primary">
                  {item.label}
                </SmartLink>
              </li>
            ))}
            {settings.instagram_url && (
              <li>
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Instagram
                </a>
              </li>
            )}
            {settings.facebook_url && (
              <li>
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
