import { describe, it, expect } from "vitest";
import * as Y from "yjs";

describe("CRDT Convergence", () => {
  it("should converge two Y.Doc instances after sync", () => {
    // Create two independent Y.Doc instances
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    // Create Y.Maps for nodes and edges on both docs
    const nodes1 = doc1.getMap<Y.Map<any>>("nodes");
    const edges1 = doc1.getMap<Y.Map<any>>("edges");
    const nodes2 = doc2.getMap<Y.Map<any>>("nodes");
    const edges2 = doc2.getMap<Y.Map<any>>("edges");

    // Apply changes to doc1
    const node1 = new Y.Map();
    node1.set("id", "node-1");
    node1.set("type", "rectangle");
    node1.set("x", 100);
    node1.set("y", 100);
    node1.set("width", 150);
    node1.set("height", 100);
    node1.set("content", "Doc 1 Node");
    node1.set("color", "#42b883");
    nodes1.set("node-1", node1);

    // Apply different changes to doc2
    const node2 = new Y.Map();
    node2.set("id", "node-2");
    node2.set("type", "circle");
    node2.set("x", 300);
    node2.set("y", 200);
    node2.set("width", 100);
    node2.set("height", 100);
    node2.set("content", "Doc 2 Node");
    node2.set("color", "#646cff");
    nodes2.set("node-2", node2);

    // Simulate sync by encoding/decoding state vectors and updates
    const stateVector1 = Y.encodeStateVector(doc1);
    const stateVector2 = Y.encodeStateVector(doc2);

    const update1 = Y.encodeStateAsUpdate(doc1, stateVector2);
    const update2 = Y.encodeStateAsUpdate(doc2, stateVector1);

    // Apply the updates to sync both documents
    Y.applyUpdate(doc1, update2);
    Y.applyUpdate(doc2, update1);

    // Verify convergence - both docs should have the same state
    expect(nodes1.size).toBe(nodes2.size);
    expect(edges1.size).toBe(edges2.size);

    // Check that both nodes exist in both docs
    expect(nodes1.has("node-1")).toBe(true);
    expect(nodes1.has("node-2")).toBe(true);
    expect(nodes2.has("node-1")).toBe(true);
    expect(nodes2.has("node-2")).toBe(true);

    // Verify node data is identical
    const doc1Node1 = nodes1.get("node-1");
    const doc2Node1 = nodes2.get("node-1");
    expect(doc1Node1).toBeDefined();
    expect(doc2Node1).toBeDefined();
    if (doc1Node1 && doc2Node1) {
      expect(doc1Node1.toJSON()).toEqual(doc2Node1.toJSON());
    }

    const doc1Node2 = nodes1.get("node-2");
    const doc2Node2 = nodes2.get("node-2");
    expect(doc1Node2).toBeDefined();
    expect(doc2Node2).toBeDefined();
    if (doc1Node2 && doc2Node2) {
      expect(doc1Node2.toJSON()).toEqual(doc2Node2.toJSON());
    }

    // Clean up
    doc1.destroy();
    doc2.destroy();
  });

  it("should handle concurrent updates correctly", () => {
    // Create two documents
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const nodes1 = doc1.getMap<Y.Map<any>>("nodes");
    const nodes2 = doc2.getMap<Y.Map<any>>("nodes");

    // Initial sync - both docs start with empty state
    const initialUpdate1 = Y.encodeStateAsUpdate(doc1);
    const initialUpdate2 = Y.encodeStateAsUpdate(doc2);
    Y.applyUpdate(doc1, initialUpdate2);
    Y.applyUpdate(doc2, initialUpdate1);

    // Create a shared node in both docs (simulating the same node being edited concurrently)
    const node1 = new Y.Map();
    node1.set("id", "concurrent-node");
    node1.set("x", 100);
    node1.set("y", 100);
    nodes1.set("concurrent-node", node1);

    // Sync so both docs have the initial node
    const syncUpdate1 = Y.encodeStateAsUpdate(doc1);
    const syncUpdate2 = Y.encodeStateAsUpdate(doc2);
    Y.applyUpdate(doc1, syncUpdate2);
    Y.applyUpdate(doc2, syncUpdate1);

    // Now apply concurrent updates to the same node
    const nodeFromDoc1 = nodes1.get("concurrent-node");
    const nodeFromDoc2 = nodes2.get("concurrent-node");
    expect(nodeFromDoc1).toBeDefined();
    expect(nodeFromDoc2).toBeDefined();

    // Doc1 updates position properties
    nodeFromDoc1.set("x", 200); // Change x coordinate

    // Doc2 updates type properties (simulating concurrent editing)
    nodeFromDoc2.set("type", "rectangle");
    nodeFromDoc2.set("width", 150);

    // Sync the concurrent changes
    const stateVector1 = Y.encodeStateVector(doc1);
    const stateVector2 = Y.encodeStateVector(doc2);
    const update1 = Y.encodeStateAsUpdate(doc1, stateVector2);
    const update2 = Y.encodeStateAsUpdate(doc2, stateVector1);

    Y.applyUpdate(doc1, update2);
    Y.applyUpdate(doc2, update1);

    // Both docs should have merged the concurrent changes
    const finalNode1 = nodes1.get("concurrent-node");
    const finalNode2 = nodes2.get("concurrent-node");
    expect(finalNode1).toBeDefined();
    expect(finalNode2).toBeDefined();
    if (finalNode1 && finalNode2) {
      const node1Json = finalNode1.toJSON();
      const node2Json = finalNode2.toJSON();
      expect(node1Json).toEqual(node2Json);
      expect(node1Json.id).toBe("concurrent-node");
      expect(node1Json.x).toBe(200); // Doc1's change should win for x
      expect(node1Json.y).toBe(100); // Original value
      expect(node1Json.type).toBe("rectangle"); // Doc2's addition
      expect(node1Json.width).toBe(150); // Doc2's addition
    }

    // Clean up
    doc1.destroy();
    doc2.destroy();
  });

  it("should maintain consistency with multiple sync rounds", () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const nodes1 = doc1.getMap<Y.Map<any>>("nodes");
    const nodes2 = doc2.getMap<Y.Map<any>>("nodes");

    // Round 1: Initial sync
    const update1 = Y.encodeStateAsUpdate(doc1);
    const update2 = Y.encodeStateAsUpdate(doc2);
    Y.applyUpdate(doc1, update2);
    Y.applyUpdate(doc2, update1);

    // Round 2: Add nodes in sequence
    const nodeA = new Y.Map();
    nodeA.set("id", "node-a");
    nodeA.set("x", 50);
    nodes1.set("node-a", nodeA);

    // Sync after first change
    const sv1_1 = Y.encodeStateVector(doc1);
    const sv2_1 = Y.encodeStateVector(doc2);
    const update1_1 = Y.encodeStateAsUpdate(doc1, sv2_1);
    const update2_1 = Y.encodeStateAsUpdate(doc2, sv1_1);
    Y.applyUpdate(doc1, update2_1);
    Y.applyUpdate(doc2, update1_1);

    // Round 3: Add another node
    const nodeB = new Y.Map();
    nodeB.set("id", "node-b");
    nodeB.set("x", 150);
    nodes2.set("node-b", nodeB);

    // Final sync
    const sv1_2 = Y.encodeStateVector(doc1);
    const sv2_2 = Y.encodeStateVector(doc2);
    const update1_2 = Y.encodeStateAsUpdate(doc1, sv2_2);
    const update2_2 = Y.encodeStateAsUpdate(doc2, sv1_2);
    Y.applyUpdate(doc1, update2_2);
    Y.applyUpdate(doc2, update1_2);

    // Verify final consistency
    expect(nodes1.size).toBe(2);
    expect(nodes2.size).toBe(2);
    expect(nodes1.has("node-a")).toBe(true);
    expect(nodes1.has("node-b")).toBe(true);
    expect(nodes2.has("node-a")).toBe(true);
    expect(nodes2.has("node-b")).toBe(true);

    const doc1NodeA = nodes1.get("node-a");
    const doc2NodeA = nodes2.get("node-a");
    const doc1NodeB = nodes1.get("node-b");
    const doc2NodeB = nodes2.get("node-b");

    expect(doc1NodeA).toBeDefined();
    expect(doc2NodeA).toBeDefined();
    expect(doc1NodeB).toBeDefined();
    expect(doc2NodeB).toBeDefined();

    if (doc1NodeA && doc2NodeA) {
      expect(doc1NodeA.toJSON()).toEqual(doc2NodeA.toJSON());
    }
    if (doc1NodeB && doc2NodeB) {
      expect(doc1NodeB.toJSON()).toEqual(doc2NodeB.toJSON());
    }

    // Clean up
    doc1.destroy();
    doc2.destroy();
  });
});
