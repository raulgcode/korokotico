import { Link } from "react-router";
import { assetUrl } from "~/lib/assets";
import type { SiteSettings } from "~/lib/types";
import { cn } from "~/lib/utils";

export function Logo({ settings, className }: { settings: SiteSettings; className?: string }) {
  return (
    <Link to="/" prefetch="intent" className={cn("flex shrink-0 items-center", className)} aria-label={`${settings.site_name}, inicio`}>
      {settings.logo ? (
        <img src={assetUrl(settings.logo, { height: 96 })} alt={settings.site_name} className="h-10 w-auto sm:h-11" width={160} height={40} />
      ) : (
        <span className="font-display text-2xl font-semibold">{settings.site_name}</span>
      )}
    </Link>
  );
}
