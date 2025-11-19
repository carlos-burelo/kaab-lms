'use client'

import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  type Node,
  type NodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { DesignerEdge, DesignerNode, NodeData } from '@/types/learning-path-designer'
import { DesignerToolbar } from './DesignerToolbar'
import { CourseNode } from './nodes/CourseNode'
import { DecisionNode } from './nodes/DecisionNode'
import { EndNode } from './nodes/EndNode'
import { StartNode } from './nodes/StartNode'
import { SyncNode } from './nodes/SyncNode'
import { PropertiesPanel } from './PropertiesPanel'

const nodeTypes: NodeTypes = {
  course: CourseNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
  sync: SyncNode
}

export interface LearningPathDesignerProps {
  learningPathId: string
  initialNodes?: DesignerNode[]
  initialEdges?: DesignerEdge[]
  onSave?: (nodes: DesignerNode[], edges: DesignerEdge[]) => void
}

export const LearningPathDesigner: React.FC<LearningPathDesignerProps> = ({ initialNodes = [], initialEdges = [], onSave }) => {
  // Convert DesignerNode to ReactFlow Node format
  const convertNodes = (nodes: DesignerNode[]): Node[] => {
    return nodes.map((node) => ({
      id: node.id,
      data: { label: node.title, ...node.data },
      position: node.position,
      type: node.type.toLowerCase()
    }))
  }

  // Convert DesignerEdge to ReactFlow Edge format
  const convertEdges = (edges: DesignerEdge[]): Edge[] => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      data: { condition: edge.condition }
    }))
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(convertNodes(initialNodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertEdges(initialEdges))
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>()
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | undefined>()
  const _reactFlowInstance = useReactFlow()

  // Handle connection between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        markerEnd: { type: MarkerType.ArrowClosed }
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  // Handle node drag
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
    setSelectedEdgeId(undefined)
  }, [])

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id)
    setSelectedNodeId(undefined)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(undefined)
    setSelectedEdgeId(undefined)
  }, [])

  // Add new node to canvas
  const addNode = useCallback(
    (type: string, label: string) => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        data: { label },
        position: { x: 250, y: 250 },
        type: type.toLowerCase()
      }
      setNodes((nds) => [...nds, newNode])
    },
    [setNodes]
  )

  // Delete selected node or edge
  const deleteSelected = useCallback(() => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId))
      setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
      setSelectedNodeId(undefined)
    } else if (selectedEdgeId) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId))
      setSelectedEdgeId(undefined)
    }
  }, [selectedNodeId, selectedEdgeId, setNodes, setEdges])

  // Update selected node data
  const updateSelectedNode = useCallback(
    (data: Partial<NodeData>) => {
      if (selectedNodeId) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === selectedNodeId) {
              return {
                ...n,
                data: { ...n.data, ...data }
              }
            }
            return n
          })
        )
      }
    },
    [selectedNodeId, setNodes]
  )

  // Save learning path
  const handleSave = useCallback(() => {
    // Convert back to DesignerNode and DesignerEdge format
    const designerNodes: DesignerNode[] = nodes.map((n) => ({
      id: n.id,
      type: (n.type?.toUpperCase() || 'COURSE') as any,
      title: n.data.label || n.id,
      position: n.position,
      data: n.data,
      isOptional: n.data.isOptional || false
    }))

    const designerEdges: DesignerEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: typeof e.label === 'string' ? e.label : undefined,
      condition: e.data?.condition
    }))

    onSave?.(designerNodes, designerEdges)
  }, [nodes, edges, onSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, deleteSelected])

  return (
    <div className='flex h-screen flex-col'>
      {/* Toolbar */}
      <DesignerToolbar
        onAddNode={addNode}
        onDelete={deleteSelected}
        onSave={handleSave}
        canDelete={!!selectedNodeId || !!selectedEdgeId}
      />

      {/* Main Canvas */}
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex-1'>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        <PropertiesPanel
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          node={selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : undefined}
          edge={selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) : undefined}
          onNodeDataChange={updateSelectedNode}
          onEdgeDataChange={(data) => {
            if (selectedEdgeId) {
              setEdges((eds) =>
                eds.map((e) => {
                  if (e.id === selectedEdgeId) {
                    return { ...e, label: data.label, data }
                  }
                  return e
                })
              )
            }
          }}
        />
      </div>
    </div>
  )
}
