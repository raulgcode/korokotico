import type { FileRef } from "./types";

type Transform = { width?: number; height?: number; quality?: number; fit?: "cover" | "contain" | "inside" };

/** URL de una imagen del CMS, servida por la propia web (ver routes/assets.ts) */
export function assetUrl(file: FileRef | { id: string } | string | null | undefined, t: Transform = {}) {
  if (!file) return undefined;
  const id = typeof file === "string" ? file : file.id;
  const isSvg = typeof file === "object" && "type" in file && file.type === "image/svg+xml";
  const params = new URLSearchParams();
  if (!isSvg) {
    if (t.width) params.set("width", String(t.width));
    if (t.height) params.set("height", String(t.height));
    if (t.fit) params.set("fit", t.fit);
    params.set("quality", String(t.quality ?? 80));
    params.set("format", "auto");
  }
  const qs = params.toString();
  return `/assets/${id}${qs ? `?${qs}` : ""}`;
}

export function srcSet(file: FileRef | null | undefined, widths: number[]) {
  if (!file || file.type === "image/svg+xml") return undefined;
  return widths.map((w) => `${assetUrl(file, { width: w })} ${w}w`).join(", ");
}
