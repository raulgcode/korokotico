import { FALLBACK_THEME, FONTS, THEMES, type FontName, type ThemeName } from "~/theme.config";
import type { Theme } from "./types";

/** Colores del CMS → variables CSS de app.css */
const COLOR_FIELDS = [
  "background",
  "foreground",
  "card",
  "card_foreground",
  "primary",
  "primary_foreground",
  "secondary",
  "secondary_foreground",
  "muted",
  "muted_foreground",
  "accent",
  "accent_foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "leaf",
  "sun",
  "cocoa",
] as const;

export type ColorField = (typeof COLOR_FIELDS)[number];

const isColor = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v.trim());
const isFont = (v: unknown): v is FontName => typeof v === "string" && v in FONTS;

/** Tema que ve la web: base de app.css + lo que se haya cambiado en el CMS */
export function resolveTheme(cms: Theme | null | undefined) {
  const name: ThemeName = cms?.base && cms.base in THEMES ? (cms.base as ThemeName) : FALLBACK_THEME;
  const base = THEMES[name];
  const displayFont = isFont(cms?.display_font) ? cms.display_font : base.displayFont;
  const bodyFont = isFont(cms?.body_font) ? cms.body_font : base.bodyFont;

  const style: Record<string, string> = {};
  for (const key of COLOR_FIELDS) {
    const value = cms?.[key];
    if (isColor(value)) style[`--${key.replace("_", "-")}`] = value.trim();
  }
  // El fondo de los menús desplegables sigue a las tarjetas
  if (style["--card"]) style["--popover"] = style["--card"];
  if (style["--card-foreground"]) style["--popover-foreground"] = style["--card-foreground"];
  style["--font-display-family"] = FONTS[displayFont].stack;
  style["--font-body-family"] = FONTS[bodyFont].stack;

  const families = [...new Set([displayFont, bodyFont])].map((f) => `family=${FONTS[f].query}`).join("&");
  return {
    name,
    style,
    fontsHref: `https://fonts.googleapis.com/css2?${families}&display=swap`,
    themeColor: style["--background"] ?? base.themeColor,
  };
}
