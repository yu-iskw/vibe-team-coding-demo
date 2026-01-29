<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Konva from 'konva'
import { useGraphState } from './composables/useGraphState'
import type { NodeData, EdgeData } from './types'

const container = ref<HTMLDivElement | null>(null)
const { nodes, edges, remoteAwareness, updateNodePosition, addNode, deleteNode, addEdge, updateAwareness } = useGraphState()

let stage: Konva.Stage | null = null
let edgeLayer: Konva.Layer | null = null
let nodeLayer: Konva.Layer | null = null
let awarenessLayer: Konva.Layer | null = null
const konvaNodes = new Map<string, Konva.Group>()
const konvaEdges = new Map<string, Konva.Line>()
const konvaCursors = new Map<number, Konva.Group>()

const addRandomNode = () => {
  const id = `node-${Math.random().toString(36).substr(2, 9)}`
  addNode({
    id,
    type: 'rectangle',
    x: Math.random() * (window.innerWidth - 150),
    y: Math.random() * (window.innerHeight - 100),
    width: 150,
    height: 100,
    content: 'New Node',
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  })
}

const addEdgeBetweenNodes = () => {
  const nodeIds = Array.from(nodes.value.keys())
  if (nodeIds.length >= 2) {
    // Create an edge between first two nodes
    const sourceId = nodeIds[0]!
    const targetId = nodeIds[1]!
    const edgeId = `edge-${Math.random().toString(36).substr(2, 9)}`

    addEdge({
      id: edgeId,
      sourceId,
      targetId,
      type: 'straight'
    })
  }
}

const createKonvaNode = (nodeData: NodeData) => {
  const group = new Konva.Group({
    id: nodeData.id,
    x: nodeData.x,
    y: nodeData.y,
    draggable: true,
  })

  const rect = new Konva.Rect({
    width: nodeData.width,
    height: nodeData.height,
    fill: nodeData.color || '#42b883',
    cornerRadius: 8,
    shadowBlur: 5,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: { x: 2, y: 2 },
  })

  const text = new Konva.Text({
    text: nodeData.content || 'Node',
    fontSize: 14,
    fontFamily: 'sans-serif',
    fill: 'white',
    width: nodeData.width,
    padding: 10,
    align: 'center',
    verticalAlign: 'middle',
  })

  group.add(rect)
  group.add(text)

  group.on('dragmove', () => {
    updateNodePosition(nodeData.id, group.x(), group.y())
  })

  group.on('dblclick', () => {
    deleteNode(nodeData.id)
  })

  return group
}

const createKonvaEdge = (edgeData: EdgeData, nodesMap: Map<string, NodeData>) => {
  const sourceNode = nodesMap.get(edgeData.sourceId)
  const targetNode = nodesMap.get(edgeData.targetId)

  if (!sourceNode || !targetNode) return null

  // Calculate center points of source and target nodes
  const sourceX = sourceNode.x + sourceNode.width / 2
  const sourceY = sourceNode.y + sourceNode.height / 2
  const targetX = targetNode.x + targetNode.width / 2
  const targetY = targetNode.y + targetNode.height / 2

  const line = new Konva.Line({
    id: edgeData.id,
    points: [sourceX, sourceY, targetX, targetY],
    stroke: '#666',
    strokeWidth: 2,
    tension: 0.5, // Add slight curve for better visual appearance
  })

  return line
}

const createKonvaCursor = (clientId: number, cursor: { x: number; y: number }, user?: { name: string; color: string }) => {
  const cursorColor = user?.color || '#ff0000'

  const cursorGroup = new Konva.Group({
    id: `cursor-${clientId}`,
  })

  // Cursor circle
  const cursorCircle = new Konva.Circle({
    radius: 6,
    fill: cursorColor,
    stroke: '#fff',
    strokeWidth: 2,
    shadowColor: cursorColor,
    shadowBlur: 4,
    shadowOpacity: 0.6,
  })

  cursorGroup.add(cursorCircle)

  // Optional user name label
  if (user?.name) {
    const label = new Konva.Text({
      text: user.name,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fill: cursorColor,
      x: 10,
      y: -20,
    })
    cursorGroup.add(label)
  }

  cursorGroup.position({ x: cursor.x, y: cursor.y })

  return cursorGroup
}

onMounted(() => {
  if (!container.value) return

  stage = new Konva.Stage({
    container: container.value,
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // Create three layers in correct z-order (bottom to top)
  edgeLayer = new Konva.Layer()
  nodeLayer = new Konva.Layer()
  awarenessLayer = new Konva.Layer()

  // Add layers to stage in order (edges at bottom, awareness at top)
  stage.add(edgeLayer)
  stage.add(nodeLayer)
  stage.add(awarenessLayer)

  // Initial render - nodes
  nodes.value.forEach((nodeData) => {
    const kNode = createKonvaNode(nodeData)
    konvaNodes.set(nodeData.id, kNode)
    nodeLayer?.add(kNode)
  })
  nodeLayer.batchDraw()

  // Initial render - edges
  edges.value.forEach((edgeData) => {
    const newEdge = createKonvaEdge(edgeData, nodes.value)
    if (newEdge) {
      konvaEdges.set(edgeData.id, newEdge)
      edgeLayer?.add(newEdge)
    }
  })
  edgeLayer.batchDraw()

  // Initial render - remote cursors
  remoteAwareness.value.forEach((remoteUser, clientId) => {
    if (remoteUser.state.cursor) {
      const cursor = createKonvaCursor(clientId, remoteUser.state.cursor, remoteUser.state.user)
      konvaCursors.set(clientId, cursor)
      awarenessLayer?.add(cursor)
    }
  })
  awarenessLayer.batchDraw()

  // Track mouse movement for awareness (cursor position)
  stage.on('mousemove', () => {
    const pointerPos = stage?.getPointerPosition()
    if (pointerPos) {
      updateAwareness({
        cursor: { x: pointerPos.x, y: pointerPos.y },
      })
    }
  })

  // Handle window resize
  window.addEventListener('resize', () => {
    if (stage) {
      stage.width(window.innerWidth)
      stage.height(window.innerHeight)
    }
  })
})

onUnmounted(() => {
  if (stage) {
    stage.destroy()
  }
})

// Reactively update Konva nodes when Yjs state changes
watch(nodes, (newNodes) => {
  if (!nodeLayer) return

  // Update or add nodes
  newNodes.forEach((nodeData, id) => {
    const kNode = konvaNodes.get(id)
    if (kNode) {
      // Update existing node position if not being dragged by this user
      // In a real app, we'd use awareness to avoid jitter
      if (!kNode.isDragging()) {
        kNode.x(nodeData.x)
        kNode.y(nodeData.y)
      }
    } else {
      // Add new node
      const newNode = createKonvaNode(nodeData)
      konvaNodes.set(id, newNode)
      nodeLayer?.add(newNode)
    }
  })

  // Remove deleted nodes
  konvaNodes.forEach((kNode, id) => {
    if (!newNodes.has(id)) {
      kNode.destroy()
      konvaNodes.delete(id)
    }
  })

  nodeLayer.batchDraw()

  // Trigger edge re-rendering since node positions may have changed
  renderEdges()
}, { deep: true })

// Reactively update Konva edges when Yjs state changes
watch(edges, (newEdges) => {
  if (!edgeLayer) return

  // Clear existing edges
  konvaEdges.forEach((kEdge) => {
    kEdge.destroy()
  })
  konvaEdges.clear()

  // Add new edges
  newEdges.forEach((edgeData, id) => {
    const newEdge = createKonvaEdge(edgeData, nodes.value)
    if (newEdge) {
      konvaEdges.set(id, newEdge)
      edgeLayer?.add(newEdge)
    }
  })

  edgeLayer.batchDraw()
}, { deep: true })

// Reactively update remote cursors when awareness state changes
watch(remoteAwareness, (newAwareness) => {
  if (!awarenessLayer) return

  // Clear existing cursors
  konvaCursors.forEach((kCursor) => {
    kCursor.destroy()
  })
  konvaCursors.clear()

  // Add remote cursors (exclude local client)
  newAwareness.forEach((remoteUser, clientId) => {
    if (remoteUser.state.cursor) {
      const cursor = createKonvaCursor(clientId, remoteUser.state.cursor, remoteUser.state.user)
      konvaCursors.set(clientId, cursor)
      awarenessLayer?.add(cursor)
    }
  })

  awarenessLayer.batchDraw()
}, { deep: true })

// Function to re-render edges (called when node positions change)
const renderEdges = () => {
  if (!edgeLayer) return

  // Update existing edge positions based on current node positions
  konvaEdges.forEach((kEdge, edgeId) => {
    const edgeData = edges.value.get(edgeId)
    if (edgeData) {
      const sourceNode = nodes.value.get(edgeData.sourceId)
      const targetNode = nodes.value.get(edgeData.targetId)

      if (sourceNode && targetNode) {
        const sourceX = sourceNode.x + sourceNode.width / 2
        const sourceY = sourceNode.y + sourceNode.height / 2
        const targetX = targetNode.x + targetNode.width / 2
        const targetY = targetNode.y + targetNode.height / 2

        kEdge.points([sourceX, sourceY, targetX, targetY])
      }
    }
  })

  edgeLayer.batchDraw()
}
</script>

<template>
  <div class="canvas-container" ref="container"></div>
  <div class="controls">
    <button @click="addRandomNode">Add Node</button>
    <button @click="addEdgeBetweenNodes">Add Edge</button>
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.canvas-container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

button {
  padding: 8px 16px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #3aa876;
}
</style>
