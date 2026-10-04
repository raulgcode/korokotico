// Temas visuales que se administran en Directus (colección «Temas»).
// La web aplica el tema elegido en Ajustes del sitio → Tema activo.

// Tipografías disponibles (Google Fonts). Si agregas una aquí, agrégala también en apps/web/app/theme.config.ts
export const FONTS = ["Fredoka", "Fraunces", "Nunito", "Baloo 2", "Quicksand", "Poppins", "Montserrat", "Playfair Display", "Lora", "DM Serif Display"];

// Colores de cada tema, agrupados como se ven en el panel
export const COLOR_GROUPS = [
  ["Colores principales", [
    ["background", "Fondo"],
    ["foreground", "Texto"],
    ["primary", "Principal (botones, enlaces)"],
    ["primary_foreground", "Texto sobre principal"],
    ["secondary", "Secundario"],
    ["secondary_foreground", "Texto sobre secundario"],
    ["accent", "Acento (fondos suaves)"],
    ["accent_foreground", "Texto sobre acento"],
  ]],
  ["Tarjetas y bordes", [
    ["card", "Fondo de tarjetas"],
    ["card_foreground", "Texto de tarjetas"],
    ["muted", "Fondo apagado"],
    ["muted_foreground", "Texto secundario"],
    ["border", "Bordes"],
    ["input", "Bordes de campos"],
    ["ring", "Contorno al seleccionar"],
  ]],
  ["Detalles", [
    ["leaf", "Hojas / íconos"],
    ["sun", "Destellos"],
    ["cocoa", "Oscuro de detalles"],
    ["destructive", "Errores"],
  ]],
];

export const COLOR_FIELDS = COLOR_GROUPS.flatMap(([, fields]) => fields.map(([key]) => key));

// Los dos temas de fábrica, con los mismos valores que apps/web/app/app.css
export const DEFAULT_THEMES = [
  {
    name: "Clásico",
    key: "clasico",
    base: "clasico",
    display_font: "Fraunces",
    body_font: "Nunito",
    background: "#fbf5ec", foreground: "#3b2a22", card: "#fffaf3", card_foreground: "#3b2a22",
    primary: "#c8643b", primary_foreground: "#fffaf3", secondary: "#e3ead9", secondary_foreground: "#2f4a36",
    muted: "#f3eadd", muted_foreground: "#7a6455", accent: "#f6dccd", accent_foreground: "#6e3a24",
    destructive: "#c2410c", border: "#eadccb", input: "#e4d3bf", ring: "#c8643b",
    leaf: "#4f7a5a", sun: "#f2c95c", cocoa: "#3b2a22",
  },
  {
    name: "Marca 2026",
    key: "marca",
    base: "marca",
    display_font: "Fredoka",
    body_font: "Nunito",
    background: "#ffffff", foreground: "#01112b", card: "#ffffff", card_foreground: "#01112b",
    primary: "#7f3aef", primary_foreground: "#ffffff", secondary: "#c6ff34", secondary_foreground: "#01112b",
    muted: "#f4f2fb", muted_foreground: "#4a5468", accent: "#eeffc4", accent_foreground: "#01112b",
    destructive: "#d92d4b", border: "#e4e5e8", input: "#d3d5d9", ring: "#7f3aef",
    leaf: "#01112b", sun: "#c6ff34", cocoa: "#01112b",
  },
];
