import { useRouteLoaderData } from "react-router";
import { assetUrl, srcSet } from "~/lib/assets";
import type { SiteSettings } from "~/lib/types";
import { theme } from "~/theme.config";
import type { FileRef } from "~/lib/types";

type Props = {
  /** Archivo del CMS (objeto expandido o solo su id) */
  file: FileRef | string | null | undefined;
  alt?: string;
  className?: string;
  sizes?: string;
  widths?: number[];
  priority?: boolean;
};

export function CmsImage({ file, alt, className, sizes = "100vw", widths = [320, 640, 960, 1280], priority }: Props) {
  const root = useRouteLoaderData("root") as { settings: SiteSettings } | undefined;
  if (!file) return null;
  const ref: FileRef = typeof file === "string" ? { id: file } : file;
  // El tema puede reemplazar el símbolo de la marca que viene del CMS
  if (theme.symbol && ref.id === root?.settings.symbol?.id) {
    return <img src={theme.symbol} alt={alt ?? root.settings.site_name} loading={priority ? "eager" : "lazy"} decoding="async" className={className} />;
  }
  return (
    <img
      src={assetUrl(ref, { width: widths[widths.length - 1] })}
      srcSet={srcSet(ref, widths)}
      sizes={sizes}
      width={ref.width ?? undefined}
      height={ref.height ?? undefined}
      alt={alt ?? ref.description ?? ref.title ?? ""}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
