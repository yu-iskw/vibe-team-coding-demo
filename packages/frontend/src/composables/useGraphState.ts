import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { NodeData, EdgeData } from "../types";

interface AwarenessState {
  cursor?: { x: number; y: number };
  selection?: string[];
  user?: { name: string; color: string };
}

interface RemoteAwareness {
  clientId: number;
  state: AwarenessState;
}

export function useGraphState() {
  const ydoc = new Y.Doc();
  const yNodes = ydoc.getMap<Y.Map<unknown>>("nodes");
  const yEdges = ydoc.getMap<Y.Map<unknown>>("edges");

  const nodes = ref<Map<string, NodeData>>(new Map());
  const edges = ref<Map<string, EdgeData>>(new Map());
  const remoteAwareness = ref<Map<number, RemoteAwareness>>(new Map());

  // Update local ref when Yjs state changes
  const updateLocalState = () => {
    const newNodes = new Map<string, NodeData>();
    yNodes.forEach((yNode, id) => {
      newNodes.set(id, yNode.toJSON() as NodeData);
    });
    nodes.value = newNodes;

    const newEdges = new Map<string, EdgeData>();
    yEdges.forEach((yEdge, id) => {
      newEdges.set(id, yEdge.toJSON() as EdgeData);
    });
    edges.value = newEdges;
  };

  yNodes.observeDeep(updateLocalState);
  yEdges.observeDeep(updateLocalState);

  /**
   * Reactive index for fast edge lookup.
   * Maps nodeId -> Array of edges connected to it.
   */
  const nodeToEdges = computed(() => {
    const map = new Map<string, EdgeData[]>();
    edges.value.forEach((edge) => {
      // Add to source node
      if (!map.has(edge.sourceId)) map.set(edge.sourceId, []);
      map.get(edge.sourceId)!.push(edge);

      // Add to target node
      if (!map.has(edge.targetId)) map.set(edge.targetId, []);
      map.get(edge.targetId)!.push(edge);
    });
    return map;
  });

  const addNode = (node: NodeData) => {
    const yNode = new Y.Map();
    Object.entries(node).forEach(([key, value]) => {
      yNode.set(key, value);
    });
    yNodes.set(node.id, yNode);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    const yNode = yNodes.get(id);
    if (yNode) {
      yNode.set("x", x);
      yNode.set("y", y);
    }
  };

  const deleteNode = (id: string) => {
    yNodes.delete(id);
    // Clean up connected edges
    yEdges.forEach((yEdge, edgeId) => {
      if (yEdge.get("sourceId") === id || yEdge.get("targetId") === id) {
        yEdges.delete(edgeId);
      }
    });
  };

  const addEdge = (edge: EdgeData) => {
    const yEdge = new Y.Map();
    Object.entries(edge).forEach(([key, value]) => {
      yEdge.set(key, value);
    });
    yEdges.set(edge.id, yEdge);
  };

  // Initialize with some dummy data if empty
  const initializeIfEmpty = () => {
    if (yNodes.size === 0) {
      addNode({
        id: "node-1",
        type: "rectangle",
        x: 100,
        y: 100,
        width: 150,
        height: 100,
        content: "Hello VibeCanvas!",
        color: "#42b883",
      });
      addNode({
        id: "node-2",
        type: "rectangle",
        x: 400,
        y: 100,
        width: 150,
        height: 100,
        content: "Collaborate here",
        color: "#646cff",
      });
    }
  };

  let provider: HocuspocusProvider | null = null;

  onMounted(() => {
    // Connect to Hocuspocus provider for synchronization
    provider = new HocuspocusProvider({
      url: import.meta.env.VITE_WS_URL || "ws://localhost:1234",
      name: "vibe-canvas-room",
      document: ydoc,
      onStatus: ({ status }) => {
        console.log("Sync status:", status);
      },
      onAwarenessUpdate: ({ states }) => {
        // Update remote awareness state
        const newAwareness = new Map<number, RemoteAwareness>();
        (
          states as unknown as Array<{ clientId: number } & AwarenessState>
        ).forEach((state) => {
          if (state && typeof state.clientId === "number") {
            newAwareness.set(state.clientId, {
              clientId: state.clientId,
              state: state as AwarenessState,
            });
          }
        });
        remoteAwareness.value = newAwareness;
      },
    });

    initializeIfEmpty();
    updateLocalState();
  });

  onUnmounted(() => {
    if (provider) {
      provider.destroy();
    }
    ydoc.destroy();
  });

  // Helper function to update local awareness (cursor position, selection, etc.)
  const updateAwareness = (updates: Partial<AwarenessState>) => {
    if (!provider || !provider.awareness) return;

    const currentAwareness = provider.awareness.getLocalState() || {};
    provider.setAwarenessField(
      "cursor",
      updates.cursor ?? currentAwareness.cursor,
    );
    provider.setAwarenessField(
      "selection",
      updates.selection ?? currentAwareness.selection,
    );
    provider.setAwarenessField("user", updates.user ?? currentAwareness.user);
  };

  return {
    nodes,
    edges,
    remoteAwareness,
    addNode,
    updateNodePosition,
    deleteNode,
    addEdge,
    updateAwareness,
    nodeToEdges,
  };
}
