FROM oven/bun:1 as builder
WORKDIR /app

# 1. Copy Root Manifests
COPY package.json bun.lock ./

# --- CRITICAL FIX: Copy Manifests for BOTH Workspaces ---
# Even though we are building 'web', we need 'api' package.json
# so the lockfile validation passes.
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
# --------------------------------------------------------

# 2. Install dependencies (Now it works!)
RUN bun install --frozen-lockfile

# 3. Copy the Web Source Code and API Source (for types)
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# 4. Accept Build Variables
ARG VITE_API_URL
# Make it available to the build command
ENV VITE_API_URL=$VITE_API_URL

# 5. Build
WORKDIR /app/apps/web
RUN bun run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]