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
        "relative w-[110px] h-[110px] rotate-45 bg-card border-2 transition-all duration-200",
        selected
          ? "border-[var(--va-orange)] shadow-lg"
          : "border-border hover:border-[var(--va-orange)]/50"
      )}
      style={{ boxShadow: selected ? '0 0 20px oklch(0.7 0.15 50 / 0.3)' : undefined }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[var(--va-orange)] !border-2 !border-background"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45">
        <div className="p-1 rounded-lg bg-[var(--va-orange)]/20 mb-1">
          <GitBranch className="w-3.5 h-3.5 text-[var(--va-orange)]" />
        </div>

        <h3 className="font-medium text-[10px] text-foreground text-center leading-tight px-1 max-w-[90px]">
          {data.label}
        </h3>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[var(--va-orange)] !border-2 !border-background"
        id="bottom"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[var(--va-orange)] !border-2 !border-background"
        id="right"
      />
    </div>
  );
});
