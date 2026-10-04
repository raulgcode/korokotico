import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Páginas administradas desde el CMS (la portada usa el slug «inicio»)
  index("routes/page.tsx", { id: "home" }),
  route("colecciones/:slug", "routes/collection.tsx"),
  route("carrito", "routes/cart.tsx"),
  route("cuenta", "routes/account.tsx"),
  route("pedido/:token", "routes/order.tsx"),
  // Recursos
  route("assets/:id", "routes/assets.ts"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
  route("healthz", "routes/healthz.ts"),
  // Cualquier otra ruta se busca como página del CMS
  route("*", "routes/page.tsx", { id: "page" }),
] satisfies RouteConfig;
