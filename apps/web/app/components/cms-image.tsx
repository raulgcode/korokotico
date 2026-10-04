import { assetUrl, srcSet } from "~/lib/assets";
import type { FileRef } from "~/lib/types";

type Props = {
  file: FileRef | null | undefined;
  alt?: string;
  className?: string;
  sizes?: string;
  widths?: number[];
  priority?: boolean;
};

export function CmsImage({ file, alt, className, sizes = "100vw", widths = [320, 640, 960, 1280], priority }: Props) {
  if (!file) return null;
  return (
    <img
      src={assetUrl(file, { width: widths[widths.length - 1] })}
      srcSet={srcSet(file, widths)}
      sizes={sizes}
      width={file.width ?? undefined}
      height={file.height ?? undefined}
      alt={alt ?? file.description ?? file.title ?? ""}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
