'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionNodeData = {
  label: string;
  description?: string;
};

type ActionNodeType = Node<ActionNodeData, 'action'>;

export const ActionNode = memo(function ActionNode({ data, selected }: NodeProps<ActionNodeType>) {
  return (
    <div
      className={cn(
        "relative min-w-[140px] rounded-xl bg-card border-2 transition-all duration-200",
        selected 
          ? "border-[var(--va-green)] shadow-lg glow-cyan" 
          : "border-border hover:border-[var(--va-green)]/50"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[var(--va-green)] !border-2 !border-background"
      />
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[var(--va-green)]/20">
            <Zap className="w-4 h-4 text-[var(--va-green)]" />
          </div>
          <span className="text-xs font-medium text-[var(--va-green)] uppercase tracking-wider">
            Action
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
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[var(--va-green)] !border-2 !border-background"
      />
    </div>
  );
});
