# 9. Use pnpm and Workspace for Monorepo Management

Date: 2026-01-29

## Status

Accepted

## Context

As VibeCanvas grows, we need to share code (types, utilities, constants) between the frontend, backend, and potentially other services. Managing multiple independent repositories or using `npm link` is cumbersome and error-prone. We require a solution that supports a monorepo structure with efficient dependency management and clear package boundaries.

## Decision

We have adopted **pnpm** and its **workspace** feature as our monorepo management tool.

Key reasons for this decision:

- **Efficiency**: pnpm's content-addressable storage significantly reduces disk space usage and speeds up `pnpm install` across the workspace.
- **Strictness**: pnpm prevents "phantom dependencies" (packages using dependencies they don't explicitly declare), ensuring a more reliable build process.
- **Workspace Support**: Built-in support for linking local packages using the `workspace:` protocol (e.g., `@vibe/common`) makes it easy to share code between `packages/frontend` and other services.
- **Consistent Tooling**: Allows us to run commands across all packages (e.g., `pnpm -r test`) and manage versions centrally.

## Consequences

- **Atomic Commits**: Changes that affect both the frontend and shared libraries can be made in a single commit.
- **Simplified Dependency Updates**: Updating a shared library is instantly reflected in all packages using it.
- **Build Tooling**: We must configure our build tools (Vite, Vitest, etc.) to correctly resolve workspace links.
- **Strictness Learning Curve**: Developers must explicitly add every dependency they use, which might initially feel restrictive compared to npm/yarn.
