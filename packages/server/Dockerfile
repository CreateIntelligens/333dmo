FROM node:22-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy server package
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy server source
COPY packages/server/ ./packages/server/

WORKDIR /app/packages/server

RUN chmod +x entrypoint.sh

EXPOSE 3100

CMD ["./entrypoint.sh"]
