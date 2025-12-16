# apps/api/Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# 1. Copy root package files (for workspace dependencies)
COPY package.json bun.lock ./

# 2. Copy the API source code
COPY apps/api ./apps/api

# 3. Install dependencies
RUN bun install --frozen-lockfile

# 4. Start the server
WORKDIR /app/apps/api
CMD ["bun", "run", "src/index.ts"]