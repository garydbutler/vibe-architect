'use client';

import { useState } from 'react';
import { PrdInput } from './prd-input';
import { StoryList } from './story-list';
import { StoryDetails } from './story-details';
import { useBlueprintStore } from '@/store/blueprint-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StoriesPhase() {
  const [prdCollapsed, setPrdCollapsed] = useState(false);
  const { blueprint } = useBlueprintStore();

  return (
    <div className="h-full flex">
      {/* Left Panel - PRD Input */}
      {prdCollapsed ? (
        <div className="w-12 border-r border-border flex flex-col items-center py-4 gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPrdCollapsed(false)}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </Button>
          <div className="flex flex-col items-center gap-2 [writing-mode:vertical-lr] text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5 rotate-90" />
            <span>PRD</span>
          </div>
          {blueprint.stories.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5">
              {blueprint.stories.length}
            </Badge>
          )}
        </div>
      ) : (
        <div className={cn(
          "flex-1 min-w-[300px] border-r border-border overflow-hidden",
          "transition-all duration-200"
        )}>
          <div className="h-full p-4 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-7 w-7 z-10"
              onClick={() => setPrdCollapsed(true)}
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
            <PrdInput />
          </div>
        </div>
      )}

      {/* Middle Panel - Story List */}
      <div className={cn(
        "border-r border-border",
        prdCollapsed ? "flex-1" : "w-80 min-w-[280px]"
      )}>
        <div className="h-full p-4">
          <StoryList />
        </div>
      </div>

      {/* Right Panel - Story Details */}
      <div className={cn(
        prdCollapsed ? "flex-1" : "w-80 min-w-[280px]"
      )}>
        <div className="h-full p-4">
          <StoryDetails />
        </div>
      </div>
    </div>
  );
}
