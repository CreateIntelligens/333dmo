# Build stage
FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/web/package.json ./packages/web/

RUN pnpm install --frozen-lockfile

COPY packages/web/ ./packages/web/

WORKDIR /app/packages/web
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/packages/web/dist /usr/share/nginx/html

# Copy nginx config
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
