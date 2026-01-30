<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Konva from 'konva'
import { useGraphState } from './composables/useGraphState'
import type { NodeData } from './types'

import { useConnectors } from './composables/useConnectors'
import { useSelection } from './composables/useSelection'

const container = ref<HTMLDivElement | null>(null)
const { nodes, edges, remoteAwareness, updateNodePosition, addNode, deleteNode, addEdge, updateAwareness } = useGraphState()
const { edgePoints } = useConnectors(nodes, edges)

const stageRef = ref<any>(null)
const nodeLayerRef = ref<any>(null)

  const {
    selectedNodeIds,
    selectionRect,
    handleMouseDown: handleSelectionMouseDown,
    handleMouseMove: handleSelectionMouseMove,
    handleMouseUp: handleSelectionMouseUp,
  } = useSelection(stageRef, nodeLayerRef, nodes, updateAwareness)

  const currentTool = ref<'select' | 'add-node' | 'add-edge'>('select')

  // Keyboard shortcuts
  onMounted(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input (though we don't have any yet)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key.toLowerCase() === 'v') currentTool.value = 'select'
      if (e.key.toLowerCase() === 'n') currentTool.value = 'add-node'
      if (e.key.toLowerCase() === 'e') currentTool.value = 'add-edge'
      if (e.key === 'Backspace' || e.key === 'Delete') {
        selectedNodeIds.value.forEach(id => deleteNode(id))
        selectedNodeIds.value = []
        updateAwareness({ selection: [] })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
  })

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (currentTool.value === 'select') {
      // Clear selection if clicking on stage background
      if (e.target === stage) {
        selectedNodeIds.value = []
        updateAwareness({ selection: [] })
      }
      handleSelectionMouseDown(e)
    } else if (currentTool.value === 'add-node') {
      const pos = stage?.getPointerPosition()
      if (pos) {
        const id = `node-${Math.random().toString(36).substr(2, 9)}`
        addNode({
          id,
          type: 'rectangle',
          x: pos.x - 75,
          y: pos.y - 50,
          width: 150,
          height: 100,
          content: 'New Node',
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        })
        // Switch back to select tool after adding
        currentTool.value = 'select'
      }
    } else if (currentTool.value === 'add-edge') {
      const target = e.target
      const kNode = target.getParent()
      if (kNode && kNode instanceof Konva.Group && konvaNodes.has(kNode.id() as string)) {
        const nodeId = kNode.id() as string
        if (!selectedNodeIds.value.length) {
          selectedNodeIds.value = [nodeId]
        } else {
          const sourceId = selectedNodeIds.value[0]
          if (sourceId && sourceId !== nodeId) {
            const edgeId = `edge-${Math.random().toString(36).substr(2, 9)}`
            addEdge({
              id: edgeId,
              sourceId,
              targetId: nodeId,
              type: 'straight'
            })
            selectedNodeIds.value = []
            currentTool.value = 'select'
          }
        }
      }
    }
  }

const handleMouseMove = () => {
  if (currentTool.value === 'select') {
    handleSelectionMouseMove()
  }

  const pointerPos = stage?.getPointerPosition()
  if (pointerPos) {
    updateAwareness({
      cursor: { x: pointerPos.x, y: pointerPos.y },
    })
  }
}

const handleMouseUp = () => {
  if (currentTool.value === 'select') {
    handleSelectionMouseUp()
  }
}

let stage: Konva.Stage | null = null
let edgeLayer: Konva.Layer | null = null
let nodeLayer: Konva.Layer | null = null
let selectionLayer: Konva.Layer | null = null
let awarenessLayer: Konva.Layer | null = null
const konvaNodes = new Map<string, Konva.Group>()
const konvaEdges = new Map<string, Konva.Line>()
const konvaCursors = new Map<number, Konva.Group>()
const konvaRemoteSelections = new Map<number, Konva.Group>()

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
    stroke: (nodeData.id && selectedNodeIds.value.includes(nodeData.id)) ? '#00a1ff' : 'transparent',
    strokeWidth: 3,
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

  group.on('click', (e) => {
    // Prevent stage click from clearing selection
    e.cancelBubble = true

    if (currentTool.value === 'add-edge') {
      // Handled in handleMouseDown
      return
    }

    if (e.evt.shiftKey) {
      // Toggle selection
      if (selectedNodeIds.value.includes(nodeData.id)) {
        selectedNodeIds.value = selectedNodeIds.value.filter(id => id !== nodeData.id)
      } else {
        selectedNodeIds.value = [...selectedNodeIds.value, nodeData.id]
      }
    } else {
      // Single selection
      selectedNodeIds.value = [nodeData.id]
    }
    updateAwareness({ selection: selectedNodeIds.value })
  })

  group.on('dragstart', () => {
    // If dragging a non-selected node, select only it
    if (!selectedNodeIds.value.includes(nodeData.id)) {
      selectedNodeIds.value = [nodeData.id]
      updateAwareness({ selection: [nodeData.id] })
    }
  })

  group.on('dragmove', () => {
    updateNodePosition(nodeData.id, group.x(), group.y())

    // If multiple nodes are selected, move them all
    if (selectedNodeIds.value.includes(nodeData.id) && selectedNodeIds.value.length > 1) {
      const dx = group.x() - nodeData.x
      const dy = group.y() - nodeData.y

      selectedNodeIds.value.forEach(id => {
        if (id !== nodeData.id) {
          const otherNode = nodes.value.get(id)
          if (otherNode) {
            updateNodePosition(id, otherNode.x + dx, otherNode.y + dy)
          }
        }
      })
    }
  })

  group.on('dragend', () => {
    // Final position update to ensure sync
    updateNodePosition(nodeData.id, group.x(), group.y())
    if (selectedNodeIds.value.length > 1) {
      selectedNodeIds.value.forEach(id => {
        const kNode = konvaNodes.get(id)
        if (kNode) {
          updateNodePosition(id, kNode.x(), kNode.y())
        }
      })
    }
  })

  group.on('dblclick', () => {
    deleteNode(nodeData.id)
  })

  return group
}

// Helper functions for Konva creation - some now handled by useConnectors

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

  // Create layers in correct z-order (bottom to top)
  edgeLayer = new Konva.Layer()
  nodeLayer = new Konva.Layer()
  selectionLayer = new Konva.Layer()
  awarenessLayer = new Konva.Layer()

  nodeLayerRef.value = nodeLayer
  stageRef.value = stage

  // Add layers to stage in order (edges at bottom, awareness at top)
  stage.add(edgeLayer)
  stage.add(nodeLayer)
  stage.add(selectionLayer)
  stage.add(awarenessLayer)

  const marqueeRect = new Konva.Rect({
    fill: 'rgba(0, 161, 255, 0.3)',
    stroke: '#00a1ff',
    strokeWidth: 1,
    visible: false,
  })
  selectionLayer.add(marqueeRect)

  watch(selectionRect, (rect) => {
    if (rect) {
      marqueeRect.visible(true)
      marqueeRect.position({ x: rect.x, y: rect.y })
      marqueeRect.width(rect.width)
      marqueeRect.height(rect.height)
    } else {
      marqueeRect.visible(false)
    }
    selectionLayer?.batchDraw()
  })

  // Initial render - nodes
  nodes.value.forEach((nodeData) => {
    const kNode = createKonvaNode(nodeData)
    konvaNodes.set(nodeData.id, kNode)
    nodeLayer?.add(kNode)
  })
  nodeLayer.batchDraw()

  // Initial render - edges
  edgePoints.value.forEach((ep) => {
    const newEdge = new Konva.Line({
      id: ep.id,
      points: ep.points,
      stroke: '#666',
      strokeWidth: 2,
      tension: ep.type === 'curved' ? 0.5 : 0,
    })
    konvaEdges.set(ep.id, newEdge)
    edgeLayer?.add(newEdge)
  })
  edgeLayer?.batchDraw()

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
  stage.on('mousedown', handleMouseDown)
  stage.on('mousemove', handleMouseMove)
  stage.on('mouseup', handleMouseUp)

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

// Reactively update visual highlights when local selection changes
watch(selectedNodeIds, (newSelectedIds) => {
  konvaNodes.forEach((kNode, id) => {
    const rect = kNode.findOne('Rect') as Konva.Rect
    if (rect) {
      rect.stroke((id && newSelectedIds.includes(id)) ? '#00a1ff' : 'transparent')
    }
  })
  nodeLayer?.batchDraw()
}, { deep: true })

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

  // Trigger edge re-rendering is handled by watch(edgePoints)
}, { deep: true })

// Reactively update Konva edges when edgePoints change
watch(edgePoints, (newEdgePoints) => {
  if (!edgeLayer) return

  // Update or add edges
  newEdgePoints.forEach((ep) => {
    const kEdge = konvaEdges.get(ep.id)
    if (kEdge) {
      kEdge.points(ep.points)
    } else {
      const newEdge = new Konva.Line({
        id: ep.id,
        points: ep.points,
        stroke: '#666',
        strokeWidth: 2,
        tension: ep.type === 'curved' ? 0.5 : 0,
      })
      konvaEdges.set(ep.id, newEdge)
      edgeLayer?.add(newEdge)
    }
  })

  // Remove deleted edges
  konvaEdges.forEach((kEdge, id) => {
    if (!edges.value.has(id)) {
      kEdge.destroy()
      konvaEdges.delete(id)
    }
  })

  edgeLayer.batchDraw()
}, { deep: true })

const createKonvaRemoteSelection = (clientId: number, selection: string[], user?: { name: string; color: string }) => {
  const color = user?.color || '#ff0000'
  const group = new Konva.Group({ id: `selection-${clientId}` })

  selection.forEach(nodeId => {
    const nodeData = nodes.value.get(nodeId)
    if (nodeData) {
      const rect = new Konva.Rect({
        x: nodeData.x - 4,
        y: nodeData.y - 4,
        width: nodeData.width + 8,
        height: nodeData.height + 8,
        stroke: color,
        strokeWidth: 2,
        dash: [5, 5],
        cornerRadius: 10,
      })
      group.add(rect)
    }
  })

  return group
}

// Reactively update remote cursors when awareness state changes
watch(remoteAwareness, (newAwareness) => {
  if (!awarenessLayer) return

  // Clear existing cursors and remote selections
  konvaCursors.forEach((kCursor) => kCursor.destroy())
  konvaCursors.clear()
  konvaRemoteSelections.forEach((kSel) => kSel.destroy())
  konvaRemoteSelections.clear()

  // Add remote cursors and selections (exclude local client)
  newAwareness.forEach((remoteUser, clientId) => {
    if (remoteUser.state.cursor) {
      const cursor = createKonvaCursor(clientId, remoteUser.state.cursor, remoteUser.state.user)
      konvaCursors.set(clientId, cursor)
      awarenessLayer?.add(cursor)
    }
    if (remoteUser.state.selection && remoteUser.state.selection.length > 0) {
      const selection = createKonvaRemoteSelection(clientId, remoteUser.state.selection, remoteUser.state.user)
      konvaRemoteSelections.set(clientId, selection)
      awarenessLayer?.add(selection)
    }
  })

  awarenessLayer.batchDraw()
}, { deep: true })

</script>

<template>
  <div class="canvas-container" ref="container"></div>
  <div class="toolbar">
    <button
      :class="{ active: currentTool === 'select' }"
      @click="currentTool = 'select'"
      title="Select Tool (V)"
    >
      <span class="icon">↖</span> Select
    </button>
    <button
      :class="{ active: currentTool === 'add-node' }"
      @click="currentTool = 'add-node'"
      title="Add Node (N)"
    >
      <span class="icon">▭</span> Add Node
    </button>
    <button
      :class="{ active: currentTool === 'add-edge' }"
      @click="currentTool = 'add-edge'"
      title="Add Edge (E)"
    >
      <span class="icon">→</span> Add Edge
    </button>
    <div class="separator"></div>
    <button @click="addRandomNode" class="secondary">Random Node</button>
    <button @click="addEdgeBetweenNodes" class="secondary">Random Edge</button>
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.canvas-container {
  width: 100vw;
  height: 100vh;
  background-color: #f8f9fa;
  background-image: radial-gradient(#d1d5db 1px, transparent 1px);
  background-size: 20px 20px;
}

.toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 8px;
  background: white;
  padding: 6px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.toolbar button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: transparent;
  color: #374151;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toolbar button:hover {
  background-color: #f3f4f6;
}

.toolbar button.active {
  background-color: #42b883;
  color: white;
}

.toolbar button.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.toolbar button.secondary:hover {
  background-color: #e5e7eb;
}

.toolbar .icon {
  font-size: 18px;
}

.separator {
  width: 1px;
  background-color: #e5e7eb;
  margin: 4px 4px;
}
</style>
