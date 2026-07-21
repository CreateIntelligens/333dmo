FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy server package
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy server source
COPY packages/server/ ./packages/server/

# Build
WORKDIR /app/packages/server
RUN pnpm drizzle-kit generate || true

EXPOSE 3100

CMD ["node", "--import", "tsx", "src/index.ts"]
