# Korokotico

Sitio web de Korokotico (personajes de tela hechos a mano en Costa Rica) con un CMS para administrar todo el contenido.

```
apps/
  cms/   Directus 12 + SQLite (panel de contenido)
  web/   React Router 8 en framework mode (SSR) + Tailwind 4 + shadcn/ui
```

## Qué se administra desde el CMS

- **Páginas** (`Sitio web → Páginas`): cada página es una lista de secciones que puedes reordenar, editar, agregar o quitar
  (portada, encabezado, colecciones, pasos, historia, texto, llamado a la acción, preguntas frecuentes, contacto y el formulario
  de crear personaje). Cualquier página nueva queda publicada en `/<slug>`. La portada usa el slug `inicio`.
- **SEO de cada página**: título, descripción, imagen para compartir y opción de ocultarla de buscadores.
- **Menús**: menú principal (`header`) y del pie (`footer`).
- **Ajustes del sitio**: logo, barra superior, pie de página, WhatsApp, correo, redes y SEO por defecto.
- **Colecciones**: se publican en `/colecciones/<slug>` con su propio formulario.
- **Paquetes, complementos y zonas de envío**: precios del formulario y del carrito.
- **Solicitudes**: lo que envían los clientes desde el carrito, con sus personajes y referencias (privadas).

## Desarrollo local

Requisitos: Node 22+, pnpm 10 y Docker.

```bash
pnpm install
pnpm cms:up                          # Directus en http://localhost:8055 (admin@korokotico.com / korokotico)
cp apps/cms/.env.example apps/cms/.env   # ya trae las credenciales del docker-compose
pnpm cms:seed                        # crea el esquema, permisos, el usuario "Sitio web" y el contenido inicial
cp apps/web/.env.example apps/web/.env   # DIRECTUS_TOKEN debe ser igual a WEBSITE_TOKEN
pnpm dev                             # web en http://localhost:5173
```

`pnpm cms:seed` se puede correr cuantas veces quieras: actualiza el esquema y solo carga contenido si no hay páginas.
Con `pnpm --filter cms seed -- --force-content` borra y vuelve a cargar el contenido inicial.

`docker compose up --build` levanta las dos apps como en producción (web en http://localhost:3000).

Si la web muestra «El CMS rechazó DIRECTUS_TOKEN», el token de `apps/web/.env` no coincide con el `WEBSITE_TOKEN`
que usaste en el seed (o el seed no terminó). Iguálalos, corre `pnpm cms:seed` otra vez y reinicia `pnpm dev`.

## Temas de color

El sitio trae dos temas y el activo se elige en `apps/web/app/theme.config.ts`:

```ts
export const ACTIVE_THEME: ThemeName = "marca"; // o "clasico"
```

- `clasico`: crema y terracota (diseño original).
- `marca`: manual de marca 2026: blanco `#FFFFFF`, azul noche `#01112B`, lima `#C6FF34` y violeta `#7F3AEF`,
  con el logo y el símbolo del manual (`apps/web/public/themes/marca`).

Los colores de cada tema están en `apps/web/app/app.css` (bloques `[data-theme="..."]`). Después de cambiar el tema,
despliega la web con `pnpm release --web`.

## SEO

Cada ruta genera con `meta` de React Router: `<title>`, descripción, canonical, robots, Open Graph, Twitter Card y JSON-LD
(Organization y WebSite en la portada, BreadcrumbList, FAQPage, ItemList de colecciones y Product en cada colección).
También hay `/sitemap.xml` y `/robots.txt` generados desde el CMS. Las imágenes se sirven desde el mismo dominio en `/assets/:id`
con tamaños optimizados.

## Despliegue en Fly.io (casi gratis)

Las dos máquinas se apagan solas cuando no hay visitas (`auto_stop_machines`) y arrancan con la primera petición.
La base de datos es SQLite dentro de un volumen de 1 GB (≈ $0.15/mes), así que no se paga Postgres.

```bash
# CMS
fly apps create korokotico-cms
fly volumes create cms_data --app korokotico-cms --region mia --size 1
fly secrets set --app korokotico-cms SECRET="$(openssl rand -hex 32)" ADMIN_EMAIL=tu@correo.com ADMIN_PASSWORD='una-clave-segura'
pnpm deploy:cms
# Carga el esquema y el contenido en el CMS de producción
DIRECTUS_URL=https://korokotico-cms.fly.dev SITE_URL=https://korokotico-web.fly.dev \
  ADMIN_EMAIL=tu@correo.com ADMIN_PASSWORD='una-clave-segura' WEBSITE_TOKEN="$(openssl rand -hex 32)" pnpm cms:seed

# Web (usa el mismo WEBSITE_TOKEN del paso anterior)
fly apps create korokotico-web
fly secrets set --app korokotico-web DIRECTUS_TOKEN=<WEBSITE_TOKEN> SESSION_SECRET="$(openssl rand -hex 32)"
pnpm deploy:web
```

Si usas otros nombres de app o un dominio propio, cambia `PUBLIC_URL` en `apps/cms/fly.toml` y `DIRECTUS_URL` / `SITE_URL`
en `apps/web/fly.toml`. Haz copias del volumen con `fly volumes snapshots list`.

## Notas

- La web se creó con `create-react-router --agent-skills`: la skill oficial de React Router para agentes está en
  `apps/web/.agents/skills/react-router` y la documentación de la versión instalada en `node_modules/react-router/docs`.
- Los componentes de `apps/web/app/components/ui` son de shadcn/ui (`components.json` ya está configurado para `pnpm dlx shadcn add`).
- Las ilustraciones iniciales son provisionales: reemplázalas por fotos reales desde la biblioteca de archivos del CMS.
