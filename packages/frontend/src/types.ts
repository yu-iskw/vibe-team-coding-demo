export interface NodeData {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  anchorPoints?: string[];
}

export interface EdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  sourceAnchor?: string;
  targetAnchor?: string;
}
