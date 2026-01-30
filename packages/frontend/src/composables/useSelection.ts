import { ref, type Ref } from "vue";
import type { NodeData } from "../types";
import type Konva from "konva";

interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useSelection(
  stageRef: Ref<Konva.Stage | null>,
  nodesLayerRef: Ref<Konva.Layer | null>,
  nodes: Ref<Map<string, NodeData>>,
  updateAwareness: (updates: { selection: string[] }) => void,
) {
  const selectedNodeIds = ref<string[]>([]);
  const isSelecting = ref(false);
  const selectionRect = ref<SelectionRect | null>(null);
  const startPos = ref({ x: 0, y: 0 });

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only start marquee if clicking on the stage background
    if (e.target !== stageRef.value) {
      return;
    }

    const pos = stageRef.value?.getPointerPosition();
    if (!pos) return;

    isSelecting.value = true;
    startPos.value = { ...pos };
    selectionRect.value = { x: pos.x, y: pos.y, width: 0, height: 0 };

    // Clear selection on new marquee start
    selectedNodeIds.value = [];
    updateAwareness({ selection: [] });
  };

  const handleMouseMove = () => {
    if (!isSelecting.value || !stageRef.value) return;

    const pos = stageRef.value.getPointerPosition();
    if (!pos) return;

    const x = Math.min(startPos.value.x, pos.x);
    const y = Math.min(startPos.value.y, pos.y);
    const width = Math.abs(startPos.value.x - pos.x);
    const height = Math.abs(startPos.value.y - pos.y);

    selectionRect.value = { x, y, width, height };

    // Perform hit-testing
    if (nodesLayerRef.value) {
      const newSelectedIds: string[] = [];

      // We use the nodes from the layer to get their client rects
      nodesLayerRef.value.getChildren().forEach((node) => {
        const id = node.id();
        if (!id || !nodes.value.has(id)) return;

        const box = node.getClientRect();
        if (
          x < box.x + box.width &&
          x + width > box.x &&
          y < box.y + box.height &&
          y + height > box.y
        ) {
          newSelectedIds.push(id);
        }
      });

      selectedNodeIds.value = newSelectedIds;
      // Sync to awareness (throttled in useGraphState if needed, but here we just call it)
      updateAwareness({ selection: newSelectedIds });
    }
  };

  const handleMouseUp = () => {
    isSelecting.value = false;
    selectionRect.value = null;
  };

  return {
    selectedNodeIds,
    isSelecting,
    selectionRect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
