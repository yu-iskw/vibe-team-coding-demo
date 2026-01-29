import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { ref, onMounted, onUnmounted } from "vue";
import type { NodeData, EdgeData } from "../types";

export function useGraphState() {
  const ydoc = new Y.Doc();
  const yNodes = ydoc.getMap<Y.Map<unknown>>("nodes");
  const yEdges = ydoc.getMap<Y.Map<unknown>>("edges");

  const nodes = ref<Map<string, NodeData>>(new Map());
  const edges = ref<Map<string, EdgeData>>(new Map());

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

  let provider: WebsocketProvider | null = null;

  onMounted(() => {
    // Connect to a local websocket provider for development
    // In a real app, this would be your Hocuspocus server
    provider = new WebsocketProvider(
      "ws://localhost:1234",
      "vibe-canvas-room",
      ydoc,
    );

    provider.on("status", (event: { status: string }) => {
      console.log("Sync status:", event.status);
    });

    initializeIfEmpty();
    updateLocalState();
  });

  onUnmounted(() => {
    if (provider) {
      provider.disconnect();
    }
    ydoc.destroy();
  });

  return {
    nodes,
    edges,
    addNode,
    updateNodePosition,
    deleteNode,
    addEdge,
  };
}
