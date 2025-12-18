FROM oven/bun:1 as base
WORKDIR /app

# 1. Copy the Root manifests
COPY package.json bun.lock ./

# --- CRITICAL FIX: Copy ALL package.json files for workspaces ---
# We need all workspace package.json files so Bun knows about the workspace structure
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
# --------------------------------------------------

# 2. Now install (Bun is happy because it sees all workspaces)
RUN bun install --frozen-lockfile

# 3. Copy the shared types package (needed by API)
COPY packages/shared-types ./packages/shared-types

# 4. Copy the actual source code for API
COPY apps/api ./apps/api

# 4. Start
WORKDIR /app/apps/api
CMD ["bun", "run", "src/index.ts"]