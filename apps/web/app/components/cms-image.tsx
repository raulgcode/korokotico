import { assetUrl, srcSet } from "~/lib/assets";
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
  if (!file) return null;
  const ref: FileRef = typeof file === "string" ? { id: file } : file;
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
