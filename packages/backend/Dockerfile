# Use Node.js 24.13.0 as specified in .node-version
FROM node:24.13.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage
FROM base AS build
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

# Build the backend package and its workspace dependencies
RUN pnpm --filter @vibe-team-coding-demo/backend build

# Runtime stage
FROM base AS runtime
WORKDIR /app

# Copy built files and node_modules from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY --from=build /app/packages/backend/package.json ./packages/backend/package.json
COPY --from=build /app/packages/common/dist ./packages/common/dist
COPY --from=build /app/packages/common/package.json ./packages/common/package.json

WORKDIR /app/packages/backend

# Expose the Hocuspocus port
EXPOSE 1234

# Use non-root user
USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e 'const req = require("http").get("http://localhost:1234", (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on("error", () => process.exit(1));'

# Start the server
CMD ["node", "dist/index.js"]
