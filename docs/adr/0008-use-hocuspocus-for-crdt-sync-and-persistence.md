# 8. Use Hocuspocus for CRDT Sync and Persistence

Date: 2026-01-29

## Status

Accepted

## Context

Collaborative editing in VibeCanvas relies on Yjs for local-first state management. However, Yjs requires a backend "provider" to synchronize updates between clients and persist data to a database. We need a solution that handles WebSocket connections, awareness (cursors/presence), and database connectivity in a structured and scalable way.

## Decision

We have decided to use **Hocuspocus** as the primary CRDT relay server and persistence layer.

Key reasons for this decision:

- **Comprehensive Features**: Hocuspocus provides a robust suite of plugins for authentication, authorization, persistence (via hooks), and awareness management.
- **Yjs Integration**: As it is built by the creators of Tiptap (who are heavy Yjs users), it offers the most mature and well-documented integration for Node.js-based Yjs backends.
- **WebSocket Protocol**: It uses a standard WebSocket protocol that works efficiently with `y-websocket` providers.
- **Scalability**: Hocuspocus is designed to be extensible and can be scaled using various backends (e.g., Redis for awareness).

## Consequences

- **Simplified Backend Development**: We can leverage Hocuspocus hooks for database persistence instead of implementing a custom WebSocket sync engine.
- **State Persistence**: Changes are automatically saved to the persistence store, ensuring work is not lost when sessions end.
- **Dependency**: The backend architecture is now tightly coupled with Hocuspocus, requiring knowledge of its hook system and lifecycle.
- **Operational Complexity**: We need to manage the Hocuspocus server as a separate service or as part of our monorepo's backend package.
