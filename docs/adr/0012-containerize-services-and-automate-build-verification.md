# 12. Containerize services and automate build verification

Date: 2026-01-30

## Status

Accepted

## Context

The project needs a reproducible way to build, package, and deploy the VibeCanvas application. We also need to ensure that every change is verified against the build process to prevent regressions.

The application consists of:

1.  **Backend**: A Hocuspocus WebSocket relay server.
2.  **Frontend**: A Vue.js application.
3.  **Common**: A shared package for types and utilities.

The frontend depends on the backend via a WebSocket URL, which must be configurable for different environments.

## Decision

We decided to:

1.  **Separate Dockerfiles**: Create individual Dockerfiles for `packages/backend` and `packages/frontend`. This allows for smaller images, faster builds through independent caching, and more granular scaling.
2.  **Multi-stage Builds**: Use multi-stage Docker builds to separate the build environment (Node.js + pnpm) from the runtime environment, resulting in minimal production images.
3.  **Unprivileged Runtime**: Use unprivileged base images (`node:slim` for backend, `nginxinc/nginx-unprivileged` for frontend) and set non-root users (`node`, `nginx`) to enhance security.
4.  **Configurable Frontend**: Support the `VITE_HOCUSPOCUS_URL` environment variable in the frontend to allow dynamic WebSocket endpoint configuration.
5.  **Docker Compose**: Provide a `docker-compose.yml` file for production-like local orchestration of both services.
6.  **CI Build Check**: Implement a GitHub Action (`docker-build.yml`) that validates `pnpm build` and both Docker image builds on every push and pull request.

### System Architecture

```mermaid
graph LR
    User[User Browser] --> Frontend[Frontend (Nginx)]
    Frontend -->|ws://| Backend[Backend (Hocuspocus)]
    Frontend -.->|env: VITE_HOCUSPOCUS_URL| Backend
    subgraph Docker Infrastructure
        Frontend
        Backend
    end
```

## Consequences

### Positive

- **Reproducibility**: Development and production environments are now aligned.
- **Security**: Containers run as non-root users, reducing the attack surface.
- **CI/CD Readiness**: Every commit is verified against the build process, ensuring the project remains deployable.
- **Scalability**: Frontend and backend can be scaled independently.

### Negative

- **Complexity**: Managing Dockerfiles and a compose file adds overhead.
- **Build Time**: CI runs now include Docker builds, which may take longer than simple linting.
- **Context Size**: Docker context management is required to keep builds efficient.
