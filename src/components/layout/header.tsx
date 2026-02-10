'use client';

import { useBlueprintStore } from '@/store/blueprint-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Save, 
  FolderOpen, 
  Settings, 
  HelpCircle, 
  Moon,
  Sparkles,
  ChevronDown,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { blueprint, updateBlueprintName, isAiProcessing, currentPhase } = useBlueprintStore();

  const phaseLabels: Record<string, string> = {
    stories: 'Story Hub',
    architecture: 'Flow Canvas',
    design: 'Wireframe Wizard',
    export: 'Blueprint Export',
  };

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 gap-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            value={blueprint.name}
            onChange={(e) => updateBlueprintName(e.target.value)}
            className="h-8 w-48 bg-transparent border-none hover:bg-secondary/50 focus:bg-secondary text-sm font-medium"
            placeholder="Project name..."
          />
          <Badge variant="secondary" className="text-xs">
            v{blueprint.version}
          </Badge>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium",
              currentPhase === 'stories' && "border-[var(--va-blue)] text-[var(--va-blue)]",
              currentPhase === 'architecture' && "border-[var(--va-purple)] text-[var(--va-purple)]",
              currentPhase === 'design' && "border-[var(--va-cyan)] text-[var(--va-cyan)]",
              currentPhase === 'export' && "border-[var(--va-green)] text-[var(--va-green)]"
            )}
          >
            {phaseLabels[currentPhase]}
          </Badge>
        </div>
      </div>

      {/* Center section - AI Status */}
      <div className="flex items-center gap-2">
        {isAiProcessing && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--va-purple)]/10 border border-[var(--va-purple)]/30">
            <Cpu className="w-4 h-4 text-[var(--va-purple)] animate-pulse" />
            <span className="text-xs text-[var(--va-purple)] font-medium">AI Processing...</span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 px-3 gap-2">
          <Save className="w-4 h-4" />
          <span className="text-xs">Saved</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3 gap-2">
              <FolderOpen className="w-4 h-4" />
              <span className="text-xs">Project</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <FolderOpen className="w-4 h-4 mr-2" />
              Open Project
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Save className="w-4 h-4 mr-2" />
              Save As...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Sparkles className="w-4 h-4 mr-2" />
              New Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border" />

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
