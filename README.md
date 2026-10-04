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
- **Ajustes del sitio**: logo, tema activo, barra superior, pie de página, WhatsApp, correo, redes y SEO por defecto.
- **Temas**: colores y tipografías del sitio; puedes crear temas propios basados en los existentes.
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

Los temas se administran en Directus:

- **Sitio web → Ajustes del sitio → Tema activo**: elige el tema que usa la web.
- **Sitio web → Temas**: cambia los colores y tipografías de cada tema. Vienen dos: `Clásico` (crema y terracota)
  y `Marca 2026` (blanco `#FFFFFF`, azul noche `#01112B`, lima `#C6FF34` y violeta `#7F3AEF`).
- **Tema propio**: abre un tema y usa **Guardar como copia** (menú junto a Guardar) para copiarlo con todos sus colores,
  o crea uno nuevo, elige **Basado en** y llena solo los colores que quieras cambiar; los vacíos se toman del tema base.

Los cambios se ven en la web en unos 30 segundos, sin volver a desplegar. Los temas base viven en
`apps/web/app/app.css` (bloques `[data-theme="..."]`) y las tipografías disponibles en `apps/web/app/theme.config.ts`.

El tema solo define colores y tipografías. El logo, el símbolo (favicon) y las imágenes de cada bloque se cambian en
Directus: **Ajustes del sitio → Logo / Símbolo**, y en cada página, en la imagen del bloque (Portada, Historia, etc.).

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
fly volumes create cms_data --app korokotico-cms --region dfw --size 1
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

Si el primer deploy avisa que no pudo asignar IPs, asígnalas a mano en cada app:
`fly ips allocate-v4 --shared -a <app>` y `fly ips allocate-v6 -a <app>`.

### Siguientes despliegues: `pnpm release`

Después de la primera vez, todo es un solo comando (requiere `fly auth login`):

```bash
cp .env.fly.example .env.fly   # una sola vez: ADMIN_EMAIL, ADMIN_PASSWORD y WEBSITE_TOKEN de producción
pnpm release                   # CMS → seed (esquema y permisos) → web → comprueba que responden
pnpm release --web             # solo la web
pnpm release --cms --skip-seed # solo el CMS, sin seed
```

El seed no pisa el contenido que ya existe en producción; solo actualiza esquema y permisos.

Si usas otros nombres de app o un dominio propio, cambia `PUBLIC_URL` en `apps/cms/fly.toml` y `DIRECTUS_URL` / `SITE_URL`
en `apps/web/fly.toml`. Haz copias del volumen con `fly volumes snapshots list`.

## Notas

- La web se creó con `create-react-router --agent-skills`: la skill oficial de React Router para agentes está en
  `apps/web/.agents/skills/react-router` y la documentación de la versión instalada en `node_modules/react-router/docs`.
- Los componentes de `apps/web/app/components/ui` son de shadcn/ui (`components.json` ya está configurado para `pnpm dlx shadcn add`).
- Las ilustraciones iniciales son provisionales: reemplázalas por fotos reales desde la biblioteca de archivos del CMS.
