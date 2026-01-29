# Use Node.js 24.13.0 as specified in .node-version
FROM node:24.13.0-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace configuration and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all package.json files to allow pnpm install to work without full source
COPY packages/backend/package.json ./packages/backend/
COPY packages/common/package.json ./packages/common/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the frontend package
ARG VITE_HOCUSPOCUS_URL=ws://localhost:1234
ENV VITE_HOCUSPOCUS_URL=$VITE_HOCUSPOCUS_URL

RUN pnpm --filter frontend build

# Runtime stage: Serve static files with unprivileged Nginx
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

# Copy built assets from build stage
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html

# Expose port 8080 (default for nginx-unprivileged)
EXPOSE 8080

# Explicitly set user for security scanners
USER nginx

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080 || exit 1

CMD ["nginx", "-g", "daemon off;"]
