'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Database, Key, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EntityAttribute } from '@/types/blueprint';

type EntityNodeData = {
  name: string;
  attributes: EntityAttribute[];
};

type EntityNodeType = Node<EntityNodeData, 'entity'>;

const typeColors: Record<string, string> = {
  string: 'text-green-400',
  number: 'text-blue-400',
  boolean: 'text-orange-400',
  date: 'text-purple-400',
  reference: 'text-cyan-400',
  array: 'text-pink-400',
};

export const EntityNode = memo(function EntityNode({ data, selected }: NodeProps<EntityNodeType>) {
  return (
    <div
      className={cn(
        "relative min-w-[200px] rounded-xl bg-card border-2 overflow-hidden transition-all duration-200",
        selected 
          ? "border-[var(--va-purple)] shadow-lg glow-purple" 
          : "border-border hover:border-[var(--va-purple)]/50"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[var(--va-purple)] !border-2 !border-background"
      />
      
      {/* Header */}
      <div className="px-3 py-2 bg-[var(--va-purple)]/20 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[var(--va-purple)]" />
          <h3 className="font-semibold text-sm text-foreground">
            {data.name}
          </h3>
        </div>
      </div>

      {/* Attributes */}
      <div className="p-2">
        {data.attributes.map((attr, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 py-1 px-2 rounded hover:bg-secondary/30 text-xs font-mono"
          >
            {attr.isPrimaryKey && (
              <Key className="w-3 h-3 text-yellow-500" />
            )}
            {attr.isForeignKey && (
              <Link2 className="w-3 h-3 text-cyan-500" />
            )}
            <span className={cn(
              "flex-1",
              attr.required ? "text-foreground" : "text-muted-foreground"
            )}>
              {attr.name}
              {!attr.required && '?'}
            </span>
            <span className={cn("text-[10px]", typeColors[attr.type] || 'text-muted-foreground')}>
              {attr.type}
              {attr.referenceTo && ` → ${attr.referenceTo}`}
            </span>
          </div>
        ))}
        
        {data.attributes.length === 0 && (
          <div className="py-2 px-2 text-xs text-muted-foreground text-center">
            No attributes defined
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[var(--va-purple)] !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[var(--va-purple)] !border-2 !border-background"
        id="right"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[var(--va-purple)] !border-2 !border-background"
        id="left"
      />
    </div>
  );
});
