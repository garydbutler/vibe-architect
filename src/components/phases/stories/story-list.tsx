'use client';

import { useBlueprintStore } from '@/store/blueprint-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ListTodo, 
  Star,
  ChevronRight,
  Plus,
  Filter,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserStory } from '@/types/blueprint';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function StoryList() {
  const { 
    blueprint, 
    selectedStoryId, 
    selectStory, 
    toggleMvp,
    deleteStory,
    addStory 
  } = useBlueprintStore();

  const mvpCount = blueprint.stories.filter(s => s.isMvp).length;

  const handleAddStory = () => {
    addStory({
      role: 'user',
      action: 'perform an action',
      benefit: 'achieve a goal',
      acceptanceCriteria: [],
      isMvp: false,
      priority: 'P1',
    });
  };

  const priorityColors: Record<string, string> = {
    P0: 'bg-red-500/20 text-red-400 border-red-500/30',
    P1: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    P2: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    P3: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <Card className="flex flex-col h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTodo className="w-4 h-4 text-[var(--va-cyan)]" />
            User Stories
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1 text-[var(--va-orange)]" />
              {mvpCount} MVP
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {blueprint.stories.length} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {blueprint.stories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ListTodo className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm mb-4">
                  No stories yet. Extract them from your PRD or add manually.
                </p>
                <Button variant="outline" size="sm" onClick={handleAddStory} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Story
                </Button>
              </div>
            ) : (
              blueprint.stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  isSelected={selectedStoryId === story.id}
                  onSelect={() => selectStory(story.id)}
                  onToggleMvp={() => toggleMvp(story.id)}
                  onDelete={() => deleteStory(story.id)}
                  priorityColors={priorityColors}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {blueprint.stories.length > 0 && (
        <div className="p-3 border-t border-border/50">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddStory}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Story
          </Button>
        </div>
      )}
    </Card>
  );
}

interface StoryCardProps {
  story: UserStory;
  isSelected: boolean;
  onSelect: () => void;
  onToggleMvp: () => void;
  onDelete: () => void;
  priorityColors: Record<string, string>;
}

function StoryCard({ 
  story, 
  isSelected, 
  onSelect, 
  onToggleMvp, 
  onDelete,
  priorityColors 
}: StoryCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
        isSelected 
          ? "border-[var(--va-blue)] bg-[var(--va-blue)]/10 shadow-lg glow-blue" 
          : "border-border/50 hover:border-border hover:bg-secondary/30"
      )}
    >
      {/* MVP Toggle */}
      <div 
        className="absolute top-3 right-3 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Badge 
          variant="outline" 
          className={cn("text-[10px] font-medium", priorityColors[story.priority])}
        >
          {story.priority}
        </Badge>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">MVP</span>
          <Switch
            checked={story.isMvp}
            onCheckedChange={onToggleMvp}
            className="h-4 w-7 data-[state=checked]:bg-[var(--va-orange)]"
          />
        </div>
      </div>

      {/* Story content */}
      <div className="pr-24">
        <p className="text-sm leading-relaxed">
          <span className="text-muted-foreground">As a </span>
          <span className="text-[var(--va-cyan)] font-medium">{story.role}</span>
          <span className="text-muted-foreground">, I want to </span>
          <span className="text-foreground font-medium">{story.action}</span>
          <span className="text-muted-foreground">, so that </span>
          <span className="text-[var(--va-green)]">{story.benefit}</span>
        </p>
      </div>

      {/* Acceptance criteria preview */}
      {story.acceptanceCriteria.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {story.acceptanceCriteria.length} acceptance criteria
          </span>
        </div>
      )}

      {/* Delete button (on hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
