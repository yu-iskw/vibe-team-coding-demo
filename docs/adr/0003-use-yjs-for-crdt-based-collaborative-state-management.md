# 3. Use Yjs for CRDT-based collaborative state management

Date: 2026-01-29

## Status

Accepted

## Context

VibeCanvas requires real-time collaborative editing where multiple users can simultaneously modify a spatial graph (nodes and edges) without conflicts. Traditional "last-write-wins" approaches lead to data loss and poor user experience. We need:

- **Zero conflicts**: Mathematically guaranteed consistency across all clients
- **Offline-first capability**: Users must be able to work offline and sync when connectivity returns
- **Preservation of user intent**: Concurrent edits should merge intelligently, not overwrite each other
- **Low latency**: State synchronization should propagate quickly (P99 < 100ms target)
- **Structured data model**: The state must be a typed graph (nodes and edges) that can be programmatically queried and manipulated

Alternatives considered:

- **Automerge**: Strong CRDT implementation, but less mature ecosystem and fewer provider options
- **ShareJS**: Operational Transformation (OT) approach, but requires a central server and can have conflicts
- **Custom CRDT**: Too complex and error-prone to implement correctly

## Decision

We will use **Yjs** as the CRDT library for collaborative state management in VibeCanvas.

Yjs provides:

- **Mature CRDT implementation**: Battle-tested in production applications
- **Rich data types**: `Y.Map`, `Y.Array`, `Y.Text` for structured graph representation
- **Provider ecosystem**: Multiple sync providers (WebSocket, WebRTC, IndexedDB) including Hocuspocus for server-side relay
- **TypeScript support**: Strong typing for our TypeScript codebase
- **Performance**: Efficient binary encoding and incremental updates
- **Framework integration**: Works well with Vue 3 reactivity system

The graph model will be represented as:

- `Y.Map` for nodes (keyed by node ID)
- `Y.Map` for edges (keyed by edge ID)
- Each node/edge will be a `Y.Map` containing typed properties (position, content, metadata)

## Consequences

**Positive:**

- **Conflict-free collaboration**: Multiple users can edit simultaneously without data loss
- **Offline support**: Changes are queued locally and synced when online
- **Type safety**: Yjs integrates well with TypeScript for compile-time safety
- **Ecosystem**: Rich provider options (Hocuspocus, y-websocket) for different deployment scenarios
- **Performance**: Binary encoding and incremental updates keep sync efficient

**Challenges:**

- **Learning curve**: Team needs to understand CRDT concepts and Yjs API patterns
- **Provider setup**: Requires a relay server (Hocuspocus) or WebRTC setup for multi-client sync
- **State management complexity**: Need to carefully design the Yjs document structure to match our graph model
- **Migration path**: Future schema changes require careful versioning and migration strategies

**Mitigation:**

- Start with a simple graph model (nodes and edges) and extend incrementally
- Use Hocuspocus for initial server-side relay (simpler than WebRTC)
- Document Yjs patterns and best practices in code comments
- Plan for schema versioning from the start
