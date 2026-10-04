/**
 * Temas visuales del sitio.
 *
 * El tema activo, sus colores y tipografías se administran en Directus:
 *   - Sitio web → Temas: editar los temas o crear uno nuevo «basado en» Clásico o Marca 2026.
 *   - Sitio web → Ajustes del sitio → Tema activo: elegir cuál usa la web.
 *
 * Este archivo solo define los temas base (los bloques [data-theme="..."] de app/app.css),
 * el tema que se usa si el CMS no tiene ninguno elegido y las tipografías disponibles.
 */
export const FALLBACK_THEME: ThemeName = "marca";

export type ThemeName = keyof typeof THEMES;

type BaseTheme = {
  label: string;
  displayFont: FontName;
  bodyFont: FontName;
  /** Color de la barra del navegador en móviles */
  themeColor: string;
};

/** Tipografías que se pueden elegir en el CMS (deben coincidir con apps/cms/scripts/themes.mjs) */
export const FONTS = {
  Fredoka: { query: "Fredoka:wght@400..700", stack: '"Fredoka", ui-rounded, "Nunito", sans-serif' },
  Fraunces: {
    query: "Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700",
    stack: '"Fraunces", ui-serif, Georgia, serif',
  },
  Nunito: { query: "Nunito:wght@400;600;700;800", stack: '"Nunito", ui-sans-serif, system-ui, sans-serif' },
  "Baloo 2": { query: "Baloo+2:wght@400..800", stack: '"Baloo 2", ui-rounded, sans-serif' },
  Quicksand: { query: "Quicksand:wght@400..700", stack: '"Quicksand", ui-rounded, sans-serif' },
  Poppins: { query: "Poppins:wght@400;500;600;700;800", stack: '"Poppins", ui-sans-serif, system-ui, sans-serif' },
  Montserrat: { query: "Montserrat:wght@400..800", stack: '"Montserrat", ui-sans-serif, system-ui, sans-serif' },
  "Playfair Display": { query: "Playfair+Display:ital,wght@0,400..800;1,400..800", stack: '"Playfair Display", ui-serif, Georgia, serif' },
  Lora: { query: "Lora:ital,wght@0,400..700;1,400..700", stack: '"Lora", ui-serif, Georgia, serif' },
  "DM Serif Display": { query: "DM+Serif+Display:ital@0;1", stack: '"DM Serif Display", ui-serif, Georgia, serif' },
} as const;

export type FontName = keyof typeof FONTS;

export const THEMES = {
  clasico: { label: "Clásico", displayFont: "Fraunces", bodyFont: "Nunito", themeColor: "#fbf5ec" },
  marca: { label: "Marca 2026", displayFont: "Fredoka", bodyFont: "Nunito", themeColor: "#ffffff" },
} satisfies Record<string, BaseTheme>;
