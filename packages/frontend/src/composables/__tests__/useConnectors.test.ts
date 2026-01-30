import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useConnectors } from "../useConnectors";
import type { NodeData, EdgeData } from "../../types";

describe("useConnectors", () => {
  it("should calculate straight edge points between two rectangles", () => {
    const nodes = ref(new Map<string, NodeData>());
    const edges = ref(new Map<string, EdgeData>());

    nodes.value.set("node-1", {
      id: "node-1",
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      content: "Source",
      color: "red",
    });

    nodes.value.set("node-2", {
      id: "node-2",
      type: "rectangle",
      x: 200,
      y: 0,
      width: 100,
      height: 100,
      content: "Target",
      color: "blue",
    });

    edges.value.set("edge-1", {
      id: "edge-1",
      sourceId: "node-1",
      targetId: "node-2",
      type: "straight",
    });

    const { edgePoints } = useConnectors(nodes, edges);

    const ep = edgePoints.value[0];
    expect(ep).toBeDefined();
    if (ep) {
      expect(ep.id).toBe("edge-1");
      expect(ep.points).toEqual([100, 50, 200, 50]);
    }
  });

  it("should calculate edge points with specific anchors", () => {
    const nodes = ref(new Map<string, NodeData>());
    const edges = ref(new Map<string, EdgeData>());

    nodes.value.set("node-1", {
      id: "node-1",
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      content: "Source",
      color: "red",
    });

    nodes.value.set("node-2", {
      id: "node-2",
      type: "rectangle",
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      content: "Target",
      color: "blue",
    });

    edges.value.set("edge-1", {
      id: "edge-1",
      sourceId: "node-1",
      targetId: "node-2",
      type: "straight",
      sourceAnchor: "bottom",
      targetAnchor: "top",
    });

    const { edgePoints } = useConnectors(nodes, edges);

    const ep = edgePoints.value[0];
    expect(ep).toBeDefined();
    if (ep) {
      expect(ep.points).toEqual([50, 100, 250, 200]);
    }
  });

  it("should calculate edge points for circles", () => {
    const nodes = ref(new Map<string, NodeData>());
    const edges = ref(new Map<string, EdgeData>());

    nodes.value.set("node-1", {
      id: "node-1",
      type: "circle",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      content: "Source",
      color: "red",
    });

    nodes.value.set("node-2", {
      id: "node-2",
      type: "circle",
      x: 200,
      y: 0,
      width: 100,
      height: 100,
      content: "Target",
      color: "blue",
    });

    edges.value.set("edge-1", {
      id: "edge-1",
      sourceId: "node-1",
      targetId: "node-2",
      type: "straight",
    });

    const { edgePoints } = useConnectors(nodes, edges);

    const ep = edgePoints.value[0];
    expect(ep).toBeDefined();
    if (ep) {
      expect(ep.points).toEqual([100, 50, 200, 50]);
    }
  });

  it("should update reactively when nodes move", () => {
    const nodes = ref(new Map<string, NodeData>());
    const edges = ref(new Map<string, EdgeData>());

    const node1: NodeData = {
      id: "node-1",
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      content: "Source",
      color: "red",
    };
    nodes.value.set("node-1", node1);

    nodes.value.set("node-2", {
      id: "node-2",
      type: "rectangle",
      x: 200,
      y: 0,
      width: 100,
      height: 100,
      content: "Target",
      color: "blue",
    });

    edges.value.set("edge-1", {
      id: "edge-1",
      sourceId: "node-1",
      targetId: "node-2",
      type: "straight",
    });

    const { edgePoints } = useConnectors(nodes, edges);

    const ep1 = edgePoints.value[0];
    expect(ep1).toBeDefined();
    if (ep1) {
      expect(ep1.points).toEqual([100, 50, 200, 50]);
    }

    // Move node-1
    node1.x = 50;
    nodes.value.set("node-1", { ...node1 });

    const ep2 = edgePoints.value[0];
    expect(ep2).toBeDefined();
    if (ep2) {
      expect(ep2.points).toEqual([150, 50, 200, 50]);
    }
  });
});
