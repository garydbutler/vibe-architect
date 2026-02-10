'use client';

import { useBlueprintStore } from '@/store/blueprint-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Target, 
  Lightbulb,
  CheckCircle2,
  Plus,
  X,
  Star,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserStory } from '@/types/blueprint';

export function StoryDetails() {
  const { blueprint, selectedStoryId, updateStory, toggleMvp } = useBlueprintStore();
  
  const story = blueprint.stories.find(s => s.id === selectedStoryId);

  if (!story) {
    return (
      <Card className="flex flex-col h-full border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              Select a story to view and edit details
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const handleUpdate = (updates: Partial<UserStory>) => {
    updateStory(story.id, updates);
  };

  const handleAddCriteria = () => {
    handleUpdate({
      acceptanceCriteria: [...story.acceptanceCriteria, ''],
    });
  };

  const handleUpdateCriteria = (index: number, value: string) => {
    const newCriteria = [...story.acceptanceCriteria];
    newCriteria[index] = value;
    handleUpdate({ acceptanceCriteria: newCriteria });
  };

  const handleRemoveCriteria = (index: number) => {
    const newCriteria = story.acceptanceCriteria.filter((_, i) => i !== index);
    handleUpdate({ acceptanceCriteria: newCriteria });
  };

  return (
    <Card className="flex flex-col h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4 text-[var(--va-purple)]" />
            Story Details
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Star className={cn(
                "w-4 h-4 transition-colors",
                story.isMvp ? "text-[var(--va-orange)] fill-[var(--va-orange)]" : "text-muted-foreground"
              )} />
              <span className="text-xs text-muted-foreground">MVP</span>
              <Switch
                checked={story.isMvp}
                onCheckedChange={() => toggleMvp(story.id)}
                className="data-[state=checked]:bg-[var(--va-orange)]"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto p-4 space-y-6">
        {/* Story Format Fields */}
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3" />
                As a (Role)
              </Label>
              <Input
                value={story.role}
                onChange={(e) => handleUpdate({ role: e.target.value })}
                placeholder="user, admin, developer..."
                className="bg-secondary/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Target className="w-3 h-3" />
                I want to (Action)
              </Label>
              <Textarea
                value={story.action}
                onChange={(e) => handleUpdate({ action: e.target.value })}
                placeholder="describe the action..."
                className="bg-secondary/30 min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Lightbulb className="w-3 h-3" />
                So that (Benefit)
              </Label>
              <Textarea
                value={story.benefit}
                onChange={(e) => handleUpdate({ benefit: e.target.value })}
                placeholder="describe the benefit..."
                className="bg-secondary/30 min-h-[60px] resize-none"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Priority
          </Label>
          <Select
            value={story.priority}
            onValueChange={(value) => handleUpdate({ priority: value as UserStory['priority'] })}
          >
            <SelectTrigger className="bg-secondary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P0">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  P0 - Critical
                </span>
              </SelectItem>
              <SelectItem value="P1">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  P1 - High
                </span>
              </SelectItem>
              <SelectItem value="P2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  P2 - Medium
                </span>
              </SelectItem>
              <SelectItem value="P3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  P3 - Low
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Acceptance Criteria */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" />
              Acceptance Criteria
            </Label>
            <Badge variant="secondary" className="text-[10px]">
              {story.acceptanceCriteria.length} items
            </Badge>
          </div>
          
          <div className="space-y-2">
            {story.acceptanceCriteria.map((criteria, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex items-center justify-center w-5 h-5 mt-2 rounded-full bg-[var(--va-green)]/20 text-[var(--va-green)] text-[10px] font-medium shrink-0">
                  {index + 1}
                </div>
                <Input
                  value={criteria}
                  onChange={(e) => handleUpdateCriteria(index, e.target.value)}
                  placeholder="Acceptance criteria..."
                  className="bg-secondary/30 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveCriteria(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCriteria}
            className="w-full gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            Add Criteria
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
