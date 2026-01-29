# 4. Use Konva.js for canvas rendering

Date: 2026-01-29

## Status

Accepted

## Context

VibeCanvas requires a high-performance rendering engine capable of maintaining 60 FPS with 10,000+ objects on an infinite canvas. The rendering engine must support:

- **Smooth zooming and panning**: Users need to navigate large spatial workspaces without lag
- **High object density**: Support thousands of nodes and edges simultaneously
- **Interactive manipulation**: Real-time dragging, resizing, and selection of canvas objects
- **Reactive updates**: Efficiently update the canvas when CRDT state changes
- **WebGL acceleration**: Leverage GPU rendering for optimal performance

Alternatives considered:

- **PixiJS**: Excellent WebGL performance, but more complex API and heavier bundle size. Better suited for game development.
- **Fabric.js**: Good for interactive canvas, but performance degrades significantly with many objects (DOM-based architecture).
- **SVG/DOM-based solutions**: Cannot achieve the target performance with thousands of objects. DOM manipulation is too slow.
- **Custom WebGL**: Too complex and time-consuming to implement correctly.

## Decision

We will use **Konva.js** as the canvas rendering engine for VibeCanvas.

Konva.js provides:

- **2D Canvas abstraction**: High-level API built on top of HTML5 Canvas with WebGL acceleration
- **Scene graph architecture**: Object-oriented approach with layers, groups, and shapes that maps well to our graph model
- **Performance**: Efficient rendering with layer caching and selective redraws
- **Vue integration**: Works well with Vue 3's reactivity system via `@vueuse/core` or custom composables
- **Event handling**: Built-in support for drag, click, hover, and other interactions
- **TypeScript support**: Strong typing available via `@types/konva`
- **Moderate bundle size**: Smaller than PixiJS while still providing excellent performance

The rendering architecture will be:

- **Konva Stage**: Root container managing the canvas viewport
- **Konva Layer**: Separate layers for nodes, edges, and UI overlays
- **Reactive binding**: Watch Yjs document changes and update Konva shapes accordingly
- **Event delegation**: Handle user interactions (drag, click) and update Yjs state

## Consequences

**Positive:**

- **High performance**: Can maintain 60 FPS with thousands of objects through layer caching and selective updates
- **Developer experience**: Clean, object-oriented API that's easier to work with than raw Canvas or WebGL
- **Vue compatibility**: Integrates well with Vue 3's Composition API and reactivity
- **Rich feature set**: Built-in support for transforms, filters, animations, and event handling
- **Active maintenance**: Well-maintained library with regular updates

**Challenges:**

- **Learning curve**: Team needs to understand Konva's scene graph model and layer system
- **State synchronization**: Need careful design to keep Konva shapes in sync with Yjs CRDT state
- **Performance optimization**: Must use layer caching and selective redraws correctly to achieve target performance
- **Bundle size**: Adds ~200KB (gzipped) to the application bundle

**Mitigation:**

- Start with simple rendering (nodes as rectangles) and add complexity incrementally
- Create a reactive composable that watches Yjs changes and updates Konva shapes
- Use Konva's layer caching and `batchDraw()` for efficient updates
- Consider code-splitting or lazy loading if bundle size becomes an issue
- Document Konva patterns and performance best practices
