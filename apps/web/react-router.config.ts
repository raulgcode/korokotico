import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // Fly termina HTTPS en su proxy y react-router-serve ve la petición como http://,
  // así que el origen https:// del formulario no coincide y React Router la rechaza (400).
  // Se permiten explícitamente los dominios propios para que funcionen las acciones (carrito, pedidos).
  allowedActionOrigins: ["korokotico.com", "www.korokotico.com", "korokotico-web-prod.fly.dev"],
} satisfies Config;
