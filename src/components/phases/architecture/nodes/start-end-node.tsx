'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

type StartEndNodeData = {
  label: string;
  nodeType?: 'start' | 'end';
};

type StartEndNodeType = Node<StartEndNodeData, 'start' | 'end'>;

export const StartEndNode = memo(function StartEndNode({ data, selected, type }: NodeProps<StartEndNodeType>) {
  const isStart = type === 'start' || data.nodeType === 'start';
  
  return (
    <div
      className={cn(
        "relative w-16 h-16 rounded-full bg-card border-2 flex items-center justify-center transition-all duration-200",
        isStart 
          ? selected 
            ? "border-[var(--va-cyan)] shadow-lg" 
            : "border-border hover:border-[var(--va-cyan)]/50"
          : selected 
            ? "border-[var(--va-purple)] shadow-lg" 
            : "border-border hover:border-[var(--va-purple)]/50"
      )}
      style={{ 
        boxShadow: selected 
          ? isStart 
            ? '0 0 20px oklch(0.7 0.15 200 / 0.3)' 
            : '0 0 20px oklch(0.7 0.15 300 / 0.3)'
          : undefined 
      }}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className={cn(
            "!w-3 !h-3 !border-2 !border-background",
            "!bg-[var(--va-purple)]"
          )}
        />
      )}
      
      <div className={cn(
        "p-2 rounded-full",
        isStart ? "bg-[var(--va-cyan)]/20" : "bg-[var(--va-purple)]/20"
      )}>
        {isStart ? (
          <Play className="w-5 h-5 text-[var(--va-cyan)] fill-[var(--va-cyan)]" />
        ) : (
          <Square className="w-5 h-5 text-[var(--va-purple)] fill-[var(--va-purple)]" />
        )}
      </div>

      {isStart && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            "!w-3 !h-3 !border-2 !border-background",
            "!bg-[var(--va-cyan)]"
          )}
        />
      )}
    </div>
  );
});
