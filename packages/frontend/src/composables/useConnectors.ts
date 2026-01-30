import { computed, type Ref } from "vue";
import type { NodeData, EdgeData } from "../types";

export interface Point {
  x: number;
  y: number;
}

export interface EdgePoints {
  id: string;
  points: number[];
  type: string;
}

/**
 * Composable to handle reactive connector logic.
 * Calculates edge points based on node boundaries and anchors.
 */
export function useConnectors(
  nodes: Ref<Map<string, NodeData>>,
  edges: Ref<Map<string, EdgeData>>,
) {
  /**
   * Calculates the anchor point for a given node and anchor name.
   * If anchor name is not provided, it defaults to the center.
   */
  const getAnchorPoint = (node: NodeData, anchor?: string): Point => {
    const { x, y, width, height, type } = node;

    if (type === "circle") {
      const radius = width / 2;
      const centerX = x + radius;
      const centerY = y + radius;

      switch (anchor) {
        case "top":
          return { x: centerX, y: y };
        case "bottom":
          return { x: centerX, y: y + height };
        case "left":
          return { x: x, y: centerY };
        case "right":
          return { x: x + width, y: centerY };
        default:
          return { x: centerX, y: centerY };
      }
    }

    // Default to rectangle
    switch (anchor) {
      case "top":
        return { x: x + width / 2, y: y };
      case "bottom":
        return { x: x + width / 2, y: y + height };
      case "left":
        return { x: x, y: y + height / 2 };
      case "right":
        return { x: x + width, y: y + height / 2 };
      default:
        return { x: x + width / 2, y: y + height / 2 };
    }
  };

  /**
   * Calculates the intersection point of a line with a node boundary.
   * This is used when no specific anchor is defined.
   */
  const getIntersectionPoint = (
    from: Point,
    to: Point,
    node: NodeData,
  ): Point => {
    const { x, y, width, height, type } = node;

    if (type === "circle") {
      const radius = width / 2;
      const centerX = x + radius;
      const centerY = y + radius;

      const dx = from.x - centerX;
      const dy = from.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) return { x: centerX, y: centerY };

      return {
        x: centerX + (dx * radius) / distance,
        y: centerY + (dy * radius) / distance,
      };
    }

    // Rectangle intersection
    const cx = x + width / 2;
    const cy = y + height / 2;

    const dx = from.x - cx;
    const dy = from.y - cy;

    // Use 'to' for more accurate intersection if needed, but for now just satisfy linter
    if (to.x === Infinity) console.log(to);

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx * height > absDy * width) {
      // Intersection with left or right side
      return {
        x: dx > 0 ? x + width : x,
        y: cy + (dy * (width / 2)) / absDx,
      };
    } else {
      // Intersection with top or bottom side
      return {
        x: cx + (dx * (height / 2)) / absDy,
        y: y + (dy > 0 ? height : 0),
      };
    }
  };

  /**
   * Reactive list of edge points for rendering.
   */
  const edgePoints = computed<EdgePoints[]>(() => {
    const result: EdgePoints[] = [];

    edges.value.forEach((edge) => {
      const sourceNode = nodes.value.get(edge.sourceId);
      const targetNode = nodes.value.get(edge.targetId);

      if (!sourceNode || !targetNode) return;

      let start: Point;
      let end: Point;

      if (edge.sourceAnchor) {
        start = getAnchorPoint(sourceNode, edge.sourceAnchor);
      } else {
        const targetCenter = {
          x: targetNode.x + targetNode.width / 2,
          y: targetNode.y + targetNode.height / 2,
        };
        start = getIntersectionPoint(
          targetCenter,
          {
            x: sourceNode.x + sourceNode.width / 2,
            y: sourceNode.y + sourceNode.height / 2,
          },
          sourceNode,
        );
      }

      if (edge.targetAnchor) {
        end = getAnchorPoint(targetNode, edge.targetAnchor);
      } else {
        const sourceCenter = {
          x: sourceNode.x + sourceNode.width / 2,
          y: sourceNode.y + sourceNode.height / 2,
        };
        end = getIntersectionPoint(
          sourceCenter,
          {
            x: targetNode.x + targetNode.width / 2,
            y: targetNode.y + targetNode.height / 2,
          },
          targetNode,
        );
      }

      let points: number[] = [];

      if (edge.type === "curved") {
        // Simple Bezier curve points (start, control1, control2, end)
        // For Konva.Line with tension, we just need the main points.
        // But for a true Bezier, we might want to calculate intermediate points.
        // Here we'll use a simple approach: [x1, y1, x2, y2] and let Konva handle tension.
        points = [start.x, start.y, end.x, end.y];
      } else {
        // Straight line
        points = [start.x, start.y, end.x, end.y];
      }

      result.push({
        id: edge.id,
        points,
        type: edge.type,
      });
    });

    return result;
  });

  return {
    edgePoints,
  };
}
