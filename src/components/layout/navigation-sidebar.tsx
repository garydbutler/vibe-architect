'use client';

import { cn } from '@/lib/utils';
import { useBlueprintStore } from '@/store/blueprint-store';
import type { Phase } from '@/types/blueprint';
import { 
  BookOpen, 
  GitBranch, 
  Layout, 
  Download,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const phases: { id: Phase; label: string; icon: React.ElementType; description: string }[] = [
  { 
    id: 'stories', 
    label: 'Stories', 
    icon: BookOpen,
    description: 'Ingest PRD & extract user stories'
  },
  { 
    id: 'architecture', 
    label: 'Architecture', 
    icon: GitBranch,
    description: 'User flows & data modeling'
  },
  { 
    id: 'design', 
    label: 'Design', 
    icon: Layout,
    description: 'Wireframe screens & components'
  },
  { 
    id: 'export', 
    label: 'Export', 
    icon: Download,
    description: 'Download semantic blueprint'
  },
];

export function NavigationSidebar() {
  const { currentPhase, setPhase, blueprint } = useBlueprintStore();

  const getPhaseStatus = (phase: Phase): 'complete' | 'current' | 'upcoming' => {
    const phaseOrder = ['stories', 'architecture', 'design', 'export'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const phaseIndex = phaseOrder.indexOf(phase);
    
    if (phaseIndex < currentIndex) return 'complete';
    if (phaseIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getPhaseStats = (phase: Phase) => {
    switch (phase) {
      case 'stories':
        const mvpCount = blueprint.stories.filter(s => s.isMvp).length;
        return `${mvpCount}/${blueprint.stories.length} MVP`;
      case 'architecture':
        return `${blueprint.userFlow.nodes.length} nodes`;
      case 'design':
        return `${blueprint.screens.length} screens`;
      case 'export':
        return 'Ready';
      default:
        return '';
    }
  };

  return (
    <nav className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-2">
      {/* Logo */}
      <div className="mb-4 p-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--va-blue)] to-[var(--va-purple)] flex items-center justify-center glow-blue">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="flex flex-col gap-1 flex-1">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const status = getPhaseStatus(phase.id);
          const isActive = currentPhase === phase.id;
          
          return (
            <Tooltip key={phase.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setPhase(phase.id)}
                  className={cn(
                    "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg glow-blue" 
                      : status === 'complete'
                        ? "bg-sidebar-accent text-[var(--va-green)] hover:bg-sidebar-accent/80"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Phase indicator */}
                  <span className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center",
                    isActive 
                      ? "bg-[var(--va-cyan)] text-background"
                      : status === 'complete'
                        ? "bg-[var(--va-green)] text-background"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col gap-1">
                <div className="font-semibold">{phase.label}</div>
                <div className="text-xs text-muted-foreground">{phase.description}</div>
                <div className="text-xs text-[var(--va-cyan)]">{getPhaseStats(phase.id)}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex flex-col gap-1 items-center mt-auto mb-2">
        {phases.map((phase, index) => (
          <div
            key={`progress-${phase.id}`}
            className={cn(
              "w-1 h-4 rounded-full transition-colors",
              getPhaseStatus(phase.id) === 'current'
                ? "bg-[var(--va-blue)]"
                : getPhaseStatus(phase.id) === 'complete'
                  ? "bg-[var(--va-green)]"
                  : "bg-muted"
            )}
          />
        ))}
      </div>
    </nav>
  );
}
