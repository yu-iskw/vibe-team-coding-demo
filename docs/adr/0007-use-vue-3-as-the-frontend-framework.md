# 7. Use Vue 3 as the Frontend Framework

Date: 2026-01-29

## Status

Accepted

## Context

VibeCanvas requires a highly reactive and performant user interface to handle real-time interactions on an infinite canvas. The framework needs to support complex state management (integrated with CRDTs), modern build tooling for rapid development, and a component-based architecture for maintainability.

## Decision

We have chosen **Vue 3** (specifically version ^3.5.24) as the primary frontend framework, utilizing the **Composition API** for logic reuse and **Vite** as the build tool.

Key reasons for this choice:

- **Reactivity System**: Vue 3's proxy-based reactivity is ideal for synchronizing shared CRDT state (Yjs) with the UI and rendering engine (Konva.js).
- **Composition API**: Allows for clean encapsulation of canvas logic into reusable composables (e.g., `useGraphState`).
- **Performance**: Vue 3 is lightweight and offers excellent rendering performance for complex UIs.
- **Ecosystem**: Integration with tools like Tailwind CSS and @vueuse/core is seamless.

## Consequences

- **Easier Logic Reuse**: Using composables makes it easier to share logic between different parts of the canvas interface.
- **Development Speed**: Vite provides near-instant Hot Module Replacement (HMR), significantly speeding up the dev cycle.
- **Learning Curve**: Team members need to be familiar with the Composition API and Vue 3's reactivity nuances compared to Options API.
- **Integration**: We must ensure that Yjs transactions are correctly mapped to Vue's reactive state to avoid unnecessary re-renders.
