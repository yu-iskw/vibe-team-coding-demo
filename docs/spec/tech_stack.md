# VibeCanvas Tech Stack

This document lists the core libraries and tools used in VibeCanvas.

## Frontend

| Library          | Version  | Purpose                                   |
| :--------------- | :------- | :---------------------------------------- |
| **Vue 3**        | ^3.5.24  | Frontend framework (Composition API)      |
| **Vite**         | ^7.2.4   | Build tool and dev server                 |
| **Yjs**          | ^13.6.29 | CRDT-based collaborative state management |
| **Konva.js**     | ^10.2.0  | Canvas rendering engine                   |
| **y-websocket**  | ^3.0.0   | WebSocket sync provider for Yjs           |
| **TypeScript**   | ~5.9.3   | Static typing                             |
| **Tailwind CSS** | ^4.1.18  | Utility-first CSS framework               |
| **@vueuse/core** | ^14.1.0  | Composition API utilities                 |

## Sync & Backend

| Library        | Purpose                           |
| :------------- | :-------------------------------- |
| **Hocuspocus** | CRDT relay server and persistence |
| **WebSockets** | Communication protocol            |

## Testing

| Tool                | Purpose                                                           |
| :------------------ | :---------------------------------------------------------------- |
| **Vitest**          | Unit and integration testing (fast, Vite-native)                  |
| **@vue/test-utils** | Official library for testing Vue components                       |
| **Playwright**      | End-to-end testing (multi-browser, collaborative flow validation) |
| **y-protocols**     | Testing utilities for CRDT state updates                          |

## Development & Tooling

| Tool               | Purpose                                        |
| :----------------- | :--------------------------------------------- |
| **pnpm**           | Package management and monorepo workspace      |
| **Trunk**          | Unified linting and formatting                 |
| **Changie**        | Changelog management                           |
| **Node.js**        | Runtime environment (see `.node-version`)      |
| **GitHub Actions** | Continuous Integration / Continuous Deployment |
