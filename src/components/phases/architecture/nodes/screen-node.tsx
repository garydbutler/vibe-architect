'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScreenNodeData = {
  label: string;
  description?: string;
  linkedStoryIds?: string[];
};

type ScreenNodeType = Node<ScreenNodeData, 'screen'>;

export const ScreenNode = memo(function ScreenNode({ data, selected }: NodeProps<ScreenNodeType>) {
  return (
    <div
      className={cn(
        "relative min-w-[160px] rounded-xl bg-card border-2 transition-all duration-200",
        selected 
          ? "border-[var(--va-blue)] shadow-lg glow-blue" 
          : "border-border hover:border-[var(--va-blue)]/50"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[var(--va-blue)] !border-2 !border-background"
      />
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[var(--va-blue)]/20">
            <Monitor className="w-4 h-4 text-[var(--va-blue)]" />
          </div>
          <span className="text-xs font-medium text-[var(--va-blue)] uppercase tracking-wider">
            Screen
          </span>
        </div>
        
        <h3 className="font-medium text-sm text-foreground">
          {data.label}
        </h3>
        
        {data.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {data.description}
          </p>
        )}
        
        {data.linkedStoryIds && data.linkedStoryIds.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">
              {data.linkedStoryIds.length} stories
            </span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[var(--va-blue)] !border-2 !border-background"
      />
    </div>
  );
});
