'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useBlueprintStore } from '@/store/blueprint-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Wand2, 
  Loader2,
  Monitor,
  Zap,
  GitBranch,
  Circle,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { ScreenNode } from './nodes/screen-node';
import { ActionNode } from './nodes/action-node';
import { DecisionNode } from './nodes/decision-node';
import { StartEndNode } from './nodes/start-end-node';
import type { FlowNode as BlueprintFlowNode } from '@/types/blueprint';

const nodeTypes: NodeTypes = {
  screen: ScreenNode,
  action: ActionNode,
  decision: DecisionNode,
  start: StartEndNode,
  end: StartEndNode,
};

export function FlowCanvas() {
  const { 
    blueprint, 
    setFlowNodes, 
    setFlowEdges,
    addFlowNode,
    isAiProcessing,
    setAiProcessing,
    getMvpStories,
  } = useBlueprintStore();

  // Convert blueprint nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => 
    blueprint.userFlow.nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { 
        label: node.label, 
        description: node.description,
        linkedStoryIds: node.linkedStoryIds,
        nodeType: node.type,
      },
    })),
    [blueprint.userFlow.nodes]
  );

  // Convert blueprint edges to React Flow edges
  const initialEdges: Edge[] = useMemo(() => 
    blueprint.userFlow.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: edge.type === 'action',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: 'hsl(var(--muted-foreground))' },
    })),
    [blueprint.userFlow.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'hsl(var(--muted-foreground))' },
      }, eds));
    },
    [setEdges]
  );

  // Sync React Flow state back to store on changes
  const onNodeDragStop = useCallback(() => {
    const updatedNodes: BlueprintFlowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type as BlueprintFlowNode['type'],
      label: node.data.label as string,
      description: node.data.description as string | undefined,
      linkedStoryIds: (node.data.linkedStoryIds as string[]) || [],
      position: node.position,
    }));
    setFlowNodes(updatedNodes);
  }, [nodes, setFlowNodes]);

  const handleAddNode = (type: BlueprintFlowNode['type']) => {
    const newNode: Omit<BlueprintFlowNode, 'id'> = {
      type,
      label: type === 'screen' ? 'New Screen' 
           : type === 'action' ? 'New Action'
           : type === 'decision' ? 'Decision?'
           : type === 'start' ? 'Start'
           : 'End',
      position: { x: 250, y: 250 },
      linkedStoryIds: [],
    };
    addFlowNode(newNode);
    toast.success(`Added ${type} node`);
  };

  const handleAiGenerate = async () => {
    const mvpStories = getMvpStories();
    
    if (mvpStories.length === 0) {
      toast.error('No MVP stories', {
        description: 'Mark some stories as MVP first to generate flow.',
      });
      return;
    }

    setAiProcessing(true);

    try {
      const response = await fetch('/api/generate-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories: mvpStories }),
      });

      if (!response.ok) throw new Error('Failed to generate flow');

      const data = await response.json();
      setFlowNodes(data.nodes);
      setFlowEdges(data.edges);

      toast.success('Flow generated!', {
        description: `Created ${data.nodes.length} nodes and ${data.edges.length} connections.`,
      });
    } catch (error) {
      console.error('Error generating flow:', error);
      toast.error('Generation failed', {
        description: 'Could not generate flow. Check your API configuration.',
      });
    } finally {
      setAiProcessing(false);
    }
  };

  const mvpCount = getMvpStories().length;

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
      >
        <Background gap={20} size={1} color="hsl(var(--border))" />
        <Controls className="!bg-card !border-border" />
        <MiniMap 
          className="!bg-card !border-border"
          nodeColor={(node) => {
            switch (node.type) {
              case 'screen': return 'hsl(var(--va-blue))';
              case 'action': return 'hsl(var(--va-green))';
              case 'decision': return 'hsl(var(--va-orange))';
              default: return 'hsl(var(--muted))';
            }
          }}
        />

        {/* Top Toolbar */}
        <Panel position="top-left" className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddNode('screen')}
              className="gap-2 h-8"
            >
              <Monitor className="w-4 h-4 text-[var(--va-blue)]" />
              Screen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddNode('action')}
              className="gap-2 h-8"
            >
              <Zap className="w-4 h-4 text-[var(--va-green)]" />
              Action
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddNode('decision')}
              className="gap-2 h-8"
            >
              <GitBranch className="w-4 h-4 text-[var(--va-orange)]" />
              Decision
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddNode('start')}
              className="gap-2 h-8"
            >
              <Circle className="w-3 h-3 fill-[var(--va-cyan)]" />
              Start
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddNode('end')}
              className="gap-2 h-8"
            >
              <Square className="w-3 h-3 fill-[var(--va-purple)]" />
              End
            </Button>
          </div>
        </Panel>

        {/* AI Generate Button */}
        <Panel position="top-right">
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2">
            <Badge variant="outline" className="text-xs">
              {mvpCount} MVP stories
            </Badge>
            <Button
              onClick={handleAiGenerate}
              disabled={isAiProcessing || mvpCount === 0}
              size="sm"
              className="gap-2 bg-gradient-to-r from-[var(--va-blue)] to-[var(--va-purple)] hover:opacity-90"
            >
              {isAiProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  AI Generate Flow
                </>
              )}
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
