<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Konva from 'konva'
import { useGraphState } from './composables/useGraphState'
import type { NodeData } from './types'

const container = ref<HTMLDivElement | null>(null)
const { nodes, updateNodePosition, addNode, deleteNode } = useGraphState()

let stage: Konva.Stage | null = null
let nodeLayer: Konva.Layer | null = null
const konvaNodes = new Map<string, Konva.Group>()

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
    fill: nodeData.color,
    cornerRadius: 8,
    shadowBlur: 5,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: { x: 2, y: 2 },
  })

  const text = new Konva.Text({
    text: nodeData.content,
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

onMounted(() => {
  if (!container.value) return

  stage = new Konva.Stage({
    container: container.value,
    width: window.innerWidth,
    height: window.innerHeight,
  })

  nodeLayer = new Konva.Layer()
  stage.add(nodeLayer)

  // Initial render
  nodes.value.forEach((nodeData) => {
    const kNode = createKonvaNode(nodeData)
    konvaNodes.set(nodeData.id, kNode)
    nodeLayer?.add(kNode)
  })
  nodeLayer.draw()

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
}, { deep: true })
</script>

<template>
  <div class="canvas-container" ref="container"></div>
  <div class="controls">
    <button @click="addRandomNode">Add Node</button>
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
