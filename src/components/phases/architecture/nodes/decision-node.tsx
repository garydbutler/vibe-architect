'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

type DecisionNodeData = {
  label: string;
  description?: string;
};

type DecisionNodeType = Node<DecisionNodeData, 'decision'>;

export const DecisionNode = memo(function DecisionNode({ data, selected }: NodeProps<DecisionNodeType>) {
  return (
    <div
      className={cn(
        "relative min-w-[120px] rotate-45 rounded-lg bg-card border-2 transition-all duration-200",
        selected 
          ? "border-[var(--va-orange)] shadow-lg" 
          : "border-border hover:border-[var(--va-orange)]/50"
      )}
      style={{ boxShadow: selected ? '0 0 20px oklch(0.7 0.15 50 / 0.3)' : undefined }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[var(--va-orange)] !border-2 !border-background !-rotate-45"
      />
      
      <div className="p-4 -rotate-45">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[var(--va-orange)]/20">
            <GitBranch className="w-4 h-4 text-[var(--va-orange)]" />
          </div>
        </div>
        
        <h3 className="font-medium text-xs text-foreground text-center">
          {data.label}
        </h3>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[var(--va-orange)] !border-2 !border-background !-rotate-45"
        id="bottom"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[var(--va-orange)] !border-2 !border-background !-rotate-45"
        id="right"
      />
    </div>
  );
});
