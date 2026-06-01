# syntax=docker/dockerfile:1

# Stage 1: Base image.
FROM node:lts AS base
ENV FORCE_COLOR=0
RUN corepack enable
WORKDIR /opt/docusaurus

# Stage 2a: Development mode.
FROM base AS dev
WORKDIR /opt/docusaurus
EXPOSE 3000
CMD [ -d "node_modules" ] && pnpm start -- --host 0.0.0.0 --poll 1000 || pnpm install && pnpm start -- --host 0.0.0.0 --poll 1000

# Stage 2b: Production build mode.
FROM base AS prod
WORKDIR /opt/docusaurus
COPY . /opt/docusaurus/
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Stage 3a: Serve with `docusaurus serve`.
FROM prod AS serve
EXPOSE 3000
CMD ["pnpm", "serve", "--", "--host", "0.0.0.0", "--no-open"]

# Stage 3b: Serve with Nginx.
FROM nginx:1.27-alpine AS nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=prod /opt/docusaurus/build /usr/share/nginx/html
EXPOSE 80
