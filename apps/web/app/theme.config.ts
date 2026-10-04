/**
 * Tema visual del sitio.
 *
 * Para cambiar de tema, edita ACTIVE_THEME y vuelve a desplegar (`pnpm release --web`).
 *   - "clasico": crema y terracota (el diseño original)
 *   - "marca":   colores del manual de marca 2026 (blanco, azul noche, lima y violeta)
 *
 * Los colores de cada tema están en app/app.css, en el bloque [data-theme="..."].
 */
export const ACTIVE_THEME: ThemeName = "marca";

export type ThemeName = keyof typeof THEMES;

type ThemeConfig = {
  label: string;
  /** Hoja de Google Fonts con las tipografías del tema */
  fonts: string;
  /** Color de la barra del navegador en móviles */
  themeColor: string;
  /** Logo y símbolo propios del tema (en /public). Si no hay, se usan los del CMS. */
  logo?: string;
  symbol?: string;
};

export const THEMES = {
  clasico: {
    label: "Clásico",
    fonts:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Nunito:wght@400;600;700;800&display=swap",
    themeColor: "#fbf5ec",
  },
  marca: {
    label: "Marca 2026",
    fonts: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400..700&family=Nunito:wght@400;600;700;800&display=swap",
    themeColor: "#ffffff",
    logo: "/themes/marca/logo.svg",
    symbol: "/themes/marca/simbolo.svg",
  },
} satisfies Record<string, ThemeConfig>;

export const theme: ThemeConfig & { name: ThemeName } = { name: ACTIVE_THEME, ...THEMES[ACTIVE_THEME] };
