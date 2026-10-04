# Web (React Router 8, SSR). Se construye desde la RAÍZ del monorepo:
#   docker build -f apps/web/Dockerfile .
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter web...
COPY apps/web apps/web
RUN pnpm --filter web build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --filter web...

FROM node:22-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /repo
COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /repo/apps/web/build ./apps/web/build
COPY apps/web/package.json ./apps/web/
WORKDIR /repo/apps/web
USER node
EXPOSE 3000
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]
