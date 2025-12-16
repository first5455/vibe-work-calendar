FROM oven/bun:1 as base
WORKDIR /app

# 1. Copy the Root manifests
COPY package.json bun.lock ./

# --- CRITICAL FIX: Copy BOTH package.json files ---
# We don't need the source code of 'web', just its package.json
# so Bun knows it exists and doesn't try to edit the lockfile.
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
# --------------------------------------------------

# 2. Now install (Bun is happy because it sees all workspaces)
RUN bun install --frozen-lockfile

# 3. Copy the actual source code for API
COPY apps/api ./apps/api

# 4. Start
WORKDIR /app/apps/api
CMD ["bun", "run", "src/index.ts"]