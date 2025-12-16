FROM oven/bun:1 as builder
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web ./apps/web

# --- ADD THESE 2 LINES ---
# Accept the variable from Docker Compose
ARG VITE_API_URL
ARG VITE_PORT
# Make it available to the build command
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PORT=$VITE_PORT
# -------------------------

RUN bun install --frozen-lockfile
WORKDIR /app/apps/web
RUN bun run build
# ... (rest of file remains the same)