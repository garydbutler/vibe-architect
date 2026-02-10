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
  Database,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { EntityNode } from './nodes/entity-node';
import type { DataEntity, EntityRelationship } from '@/types/blueprint';

const nodeTypes: NodeTypes = {
  entity: EntityNode,
};

export function ErdCanvas() {
  const { 
    blueprint, 
    setEntities, 
    setRelationships,
    addEntity,
    isAiProcessing,
    setAiProcessing,
    getMvpStories,
  } = useBlueprintStore();

  // Convert entities to React Flow nodes
  const initialNodes: Node[] = useMemo(() => 
    blueprint.dataModel.entities.map(entity => ({
      id: entity.id,
      type: 'entity',
      position: entity.position,
      data: { 
        name: entity.name, 
        attributes: entity.attributes,
      },
    })),
    [blueprint.dataModel.entities]
  );

  // Convert relationships to React Flow edges
  const initialEdges: Edge[] = useMemo(() => 
    blueprint.dataModel.relationships.map(rel => ({
      id: rel.id,
      source: rel.sourceEntity,
      target: rel.targetEntity,
      label: rel.type,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: 'hsl(var(--muted-foreground))' },
      labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 10 },
      labelBgStyle: { fill: 'hsl(var(--card))' },
    })),
    [blueprint.dataModel.relationships]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        label: 'one-to-many',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'hsl(var(--muted-foreground))' },
        labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 10 },
        labelBgStyle: { fill: 'hsl(var(--card))' },
      }, eds));
    },
    [setEdges]
  );

  // Sync React Flow state back to store on changes
  const onNodeDragStop = useCallback(() => {
    const updatedEntities: DataEntity[] = nodes.map(node => ({
      id: node.id,
      name: node.data.name as string,
      attributes: node.data.attributes as DataEntity['attributes'],
      position: node.position,
    }));
    setEntities(updatedEntities);
  }, [nodes, setEntities]);

  const handleAddEntity = () => {
    const newEntity: Omit<DataEntity, 'id'> = {
      name: 'NewEntity',
      position: { x: 250, y: 250 },
      attributes: [
        { name: 'id', type: 'string', required: true, isPrimaryKey: true },
        { name: 'createdAt', type: 'date', required: true },
      ],
    };
    addEntity(newEntity);
    toast.success('Added new entity');
  };

  const handleAiGenerate = async () => {
    const mvpStories = getMvpStories();
    
    if (mvpStories.length === 0) {
      toast.error('No MVP stories', {
        description: 'Mark some stories as MVP first to generate data model.',
      });
      return;
    }

    setAiProcessing(true);

    try {
      const response = await fetch('/api/generate-erd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories: mvpStories }),
      });

      if (!response.ok) throw new Error('Failed to generate ERD');

      const data = await response.json();
      setEntities(data.entities);
      setRelationships(data.relationships);

      toast.success('Data model generated!', {
        description: `Created ${data.entities.length} entities and ${data.relationships.length} relationships.`,
      });
    } catch (error) {
      console.error('Error generating ERD:', error);
      toast.error('Generation failed', {
        description: 'Could not generate data model. Check your API configuration.',
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
          nodeColor={() => 'hsl(var(--va-purple))'}
        />

        {/* Top Toolbar */}
        <Panel position="top-left" className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddEntity}
              className="gap-2 h-8"
            >
              <Database className="w-4 h-4 text-[var(--va-purple)]" />
              Add Entity
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
              className="gap-2 bg-gradient-to-r from-[var(--va-purple)] to-[var(--va-pink)] hover:opacity-90"
            >
              {isAiProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  AI Generate ERD
                </>
              )}
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
