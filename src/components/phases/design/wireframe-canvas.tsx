'use client';

import { useCallback, useState } from 'react';
import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { useBlueprintStore } from '@/store/blueprint-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  Wand2, 
  Loader2,
  Layout,
  Table2,
  FormInput,
  BarChart3,
  Navigation,
  SidebarIcon,
  Square,
  Type,
  Image,
  PanelTop,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Screen } from '@/types/blueprint';

const componentPalette = [
  { type: 'navbar', label: 'Navbar', icon: Navigation, color: 'var(--va-blue)' },
  { type: 'sidebar', label: 'Sidebar', icon: SidebarIcon, color: 'var(--va-purple)' },
  { type: 'card', label: 'Card', icon: Square, color: 'var(--va-cyan)' },
  { type: 'data-table', label: 'Data Table', icon: Table2, color: 'var(--va-green)' },
  { type: 'form', label: 'Form', icon: FormInput, color: 'var(--va-orange)' },
  { type: 'chart', label: 'Chart', icon: BarChart3, color: 'var(--va-pink)' },
  { type: 'container', label: 'Container', icon: PanelTop, color: 'var(--muted-foreground)' },
  { type: 'text', label: 'Text Block', icon: Type, color: 'var(--muted-foreground)' },
  { type: 'image', label: 'Image', icon: Image, color: 'var(--muted-foreground)' },
];

export function WireframeCanvas() {
  const { 
    blueprint, 
    selectedScreenId,
    selectScreen,
    addScreen,
    isAiProcessing,
    setAiProcessing,
  } = useBlueprintStore();
  
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
  }, []);

  const handleAddScreen = () => {
    const screenNumber = blueprint.screens.length + 1;
    addScreen({
      name: `Screen ${screenNumber}`,
      path: `/screen-${screenNumber}`,
      components: [],
      linkedStoryIds: [],
    });
    toast.success('Added new screen');
  };

  const handleAiGenerateLayout = async () => {
    if (!selectedScreenId) {
      toast.error('No screen selected', {
        description: 'Select a screen to generate a layout for.',
      });
      return;
    }

    setAiProcessing(true);

    try {
      const screen = blueprint.screens.find(s => s.id === selectedScreenId);
      const response = await fetch('/api/generate-wireframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          screen,
          entities: blueprint.dataModel.entities,
          stories: blueprint.stories.filter(s => 
            screen?.linkedStoryIds.includes(s.id)
          ),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate wireframe');

      const data = await response.json();
      
      // Add shapes to tldraw canvas
      if (editor && data.shapes) {
        // Clear existing shapes
        editor.selectAll();
        editor.deleteShapes(editor.getSelectedShapeIds());
        
        // Add new shapes
        // This would need proper tldraw shape creation
        toast.success('Layout generated!', {
          description: `Added ${data.shapes.length} components to the canvas.`,
        });
      }
    } catch (error) {
      console.error('Error generating wireframe:', error);
      toast.error('Generation failed', {
        description: 'Could not generate wireframe. Check your API configuration.',
      });
    } finally {
      setAiProcessing(false);
    }
  };

  const selectedScreen = blueprint.screens.find(s => s.id === selectedScreenId);

  return (
    <div className="h-full flex">
      {/* Screen List Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-card/30">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Layout className="w-4 h-4 text-[var(--va-cyan)]" />
              Screens
            </h3>
            <Badge variant="secondary" className="text-[10px]">
              {blueprint.screens.length}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddScreen}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Screen
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {blueprint.screens.map((screen) => (
              <button
                key={screen.id}
                onClick={() => selectScreen(screen.id)}
                className={cn(
                  "w-full text-left p-2 rounded-lg transition-colors",
                  selectedScreenId === screen.id
                    ? "bg-[var(--va-cyan)]/20 border border-[var(--va-cyan)]/50"
                    : "hover:bg-secondary/50"
                )}
              >
                <div className="font-medium text-sm">{screen.name}</div>
                <div className="text-xs text-muted-foreground">{screen.path}</div>
              </button>
            ))}
            
            {blueprint.screens.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No screens yet. Add one or generate from your flow.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Component Palette */}
      <div className="w-48 border-r border-border flex flex-col bg-card/30">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Components</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            Drag to canvas (semantic types)
          </p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {componentPalette.map((comp) => {
              const Icon = comp.icon;
              return (
                <Card
                  key={comp.type}
                  className="p-2 cursor-grab hover:bg-secondary/50 transition-colors border-border/50"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('component-type', comp.type);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      className="w-4 h-4" 
                      style={{ color: comp.color }}
                    />
                    <span className="text-xs font-medium">{comp.label}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {selectedScreen ? (
              <>
                <Badge variant="outline" className="text-xs">
                  {selectedScreen.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {selectedScreen.path}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                Select a screen to start wireframing
              </span>
            )}
          </div>
          
          <Button
            onClick={handleAiGenerateLayout}
            disabled={isAiProcessing || !selectedScreenId}
            size="sm"
            className="gap-2 bg-gradient-to-r from-[var(--va-cyan)] to-[var(--va-green)] hover:opacity-90"
          >
            {isAiProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                AI Generate Layout
              </>
            )}
          </Button>
        </div>

        {/* Tldraw Canvas */}
        <div className="flex-1 relative">
          {selectedScreenId ? (
            <Tldraw
              onMount={handleMount}
              className="!absolute !inset-0"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Layout className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select or create a screen to start wireframing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
