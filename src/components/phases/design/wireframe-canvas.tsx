'use client';

import { useCallback, useState, useMemo } from 'react';
import { Tldraw, Editor, createShapeId, toRichText } from 'tldraw';
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
  Plus,
  Download,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { WireframeComponent } from '@/types/blueprint';

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

type ApiShape = {
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const colorMap: Record<string, string> = {
  'data-table': 'green',
  'form': 'orange',
  'card': 'blue',
  'chart': 'violet',
  'button': 'red',
  'text': 'grey',
  'input': 'yellow',
  'image': 'light-green',
  'list': 'light-blue',
  'modal': 'light-violet',
};

function apiShapesToTldraw(shapes: ApiShape[]) {
  return shapes.map((shape) => {
    const id = createShapeId();

    // Only navbar and sidebar become frames (they sit at edges and won't
    // auto-adopt content shapes). Containers become regular geo shapes
    // to prevent tldraw's frame auto-adoption from nesting elements.
    if (shape.type === 'navbar' || shape.type === 'sidebar') {
      return {
        id,
        type: 'frame' as const,
        x: shape.x,
        y: shape.y,
        props: {
          w: shape.width,
          h: shape.height,
          name: shape.label,
        },
      };
    }

    // Containers render as dashed outlines (section dividers)
    if (shape.type === 'container') {
      return {
        id,
        type: 'geo' as const,
        x: shape.x,
        y: shape.y,
        props: {
          w: shape.width,
          h: shape.height,
          geo: 'rectangle' as const,
          richText: toRichText(shape.label),
          fill: 'semi' as const,
          dash: 'dashed' as const,
          color: 'grey' as const,
        },
      };
    }

    return {
      id,
      type: 'geo' as const,
      x: shape.x,
      y: shape.y,
      props: {
        w: shape.width,
        h: shape.height,
        geo: 'rectangle' as const,
        richText: toRichText(shape.label),
        fill: 'solid' as const,
        color: (colorMap[shape.type] || 'black') as 'green' | 'orange' | 'blue' | 'violet' | 'red' | 'grey' | 'yellow' | 'light-green' | 'light-blue' | 'light-violet' | 'black',
      },
    };
  });
}

function componentsToApiShapes(components: WireframeComponent[]): ApiShape[] {
  return components.map(c => ({
    type: c.type,
    label: c.label,
    x: c.position.x,
    y: c.position.y,
    width: c.size.width,
    height: c.size.height,
  }));
}

export function WireframeCanvas() {
  const {
    blueprint,
    selectedScreenId,
    selectScreen,
    addScreen,
    updateScreen,
    isAiProcessing,
    setAiProcessing,
    generateScreensFromFlow,
  } = useBlueprintStore();

  const [editor, setEditor] = useState<Editor | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const ungeneratedCount = useMemo(() => {
    const linkedNodeIds = new Set(
      blueprint.screens.map(s => s.linkedFlowNodeId).filter(Boolean)
    );
    return blueprint.userFlow.nodes
      .filter(n => n.type === 'screen' && !linkedNodeIds.has(n.id))
      .length;
  }, [blueprint.userFlow.nodes, blueprint.screens]);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    // Load existing components for the selected screen
    const screen = useBlueprintStore.getState().blueprint.screens.find(
      s => s.id === useBlueprintStore.getState().selectedScreenId
    );
    if (screen && screen.components.length > 0) {
      const tldrawShapes = apiShapesToTldraw(componentsToApiShapes(screen.components));
      editor.createShapes(tldrawShapes);
      // Small delay to let shapes render before fitting
      requestAnimationFrame(() => editor.zoomToFit());
    }
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

  const handleImportFromFlow = () => {
    generateScreensFromFlow();
    toast.success('Screens imported from flow', {
      description: `Imported screen nodes from your user flow diagram.`,
    });
  };

  const generateWireframeForScreen = async (screenId: string) => {
    const state = useBlueprintStore.getState();
    const screen = state.blueprint.screens.find(s => s.id === screenId);
    if (!screen) return null;

    const response = await fetch('/api/generate-wireframe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        screen,
        entities: state.blueprint.dataModel.entities,
        stories: state.blueprint.stories.filter(s =>
          screen.linkedStoryIds.includes(s.id)
        ),
      }),
    });

    if (!response.ok) throw new Error('Failed to generate wireframe');
    const data = await response.json();
    return data.shapes as ApiShape[];
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
      const shapes = await generateWireframeForScreen(selectedScreenId);
      if (!shapes || shapes.length === 0) {
        toast.error('No shapes generated');
        return;
      }

      // Save components to store
      const components: WireframeComponent[] = shapes.map((s, i) => ({
        id: `comp-${Date.now()}-${i}`,
        type: s.type as WireframeComponent['type'],
        label: s.label,
        position: { x: s.x, y: s.y },
        size: { width: s.width, height: s.height },
      }));
      updateScreen(selectedScreenId, { components });

      // Render on canvas
      if (editor) {
        editor.selectAll();
        editor.deleteShapes(editor.getSelectedShapeIds());
        const tldrawShapes = apiShapesToTldraw(shapes);
        editor.createShapes(tldrawShapes);
        requestAnimationFrame(() => editor.zoomToFit());
      }

      toast.success('Layout generated!', {
        description: `Added ${shapes.length} components to the canvas.`,
      });
    } catch (error) {
      console.error('Error generating wireframe:', error);
      toast.error('Generation failed', {
        description: 'Could not generate wireframe. Check your API configuration.',
      });
    } finally {
      setAiProcessing(false);
    }
  };

  const handleGenerateAll = async () => {
    const emptyScreens = blueprint.screens.filter(s => s.components.length === 0);
    if (emptyScreens.length === 0) {
      toast.info('All screens already have wireframes');
      return;
    }

    setAiProcessing(true);
    setBatchProgress({ current: 0, total: emptyScreens.length });

    try {
      for (let i = 0; i < emptyScreens.length; i++) {
        setBatchProgress({ current: i + 1, total: emptyScreens.length });
        const screen = emptyScreens[i];

        try {
          const shapes = await generateWireframeForScreen(screen.id);
          if (shapes && shapes.length > 0) {
            const components: WireframeComponent[] = shapes.map((s, j) => ({
              id: `comp-${Date.now()}-${j}`,
              type: s.type as WireframeComponent['type'],
              label: s.label,
              position: { x: s.x, y: s.y },
              size: { width: s.width, height: s.height },
            }));
            updateScreen(screen.id, { components });
          }
        } catch {
          console.error(`Failed to generate wireframe for ${screen.name}`);
        }
      }

      // Select first screen so user sees results
      if (emptyScreens.length > 0) {
        selectScreen(emptyScreens[0].id);
      }

      toast.success('All wireframes generated!', {
        description: `Generated layouts for ${emptyScreens.length} screens.`,
      });
    } catch (error) {
      console.error('Error in batch generation:', error);
      toast.error('Batch generation failed');
    } finally {
      setAiProcessing(false);
      setBatchProgress(null);
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
          <div className="space-y-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddScreen}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Screen
            </Button>
            {ungeneratedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportFromFlow}
                className="w-full gap-2 border-[var(--va-cyan)]/50 text-[var(--va-cyan)] hover:bg-[var(--va-cyan)]/10"
              >
                <Download className="w-4 h-4" />
                Import from Flow ({ungeneratedCount})
              </Button>
            )}
          </div>
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
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{screen.name}</div>
                  {screen.components.length > 0 ? (
                    <Badge variant="secondary" className="text-[9px] bg-green-500/20 text-green-400">
                      {screen.components.length}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] bg-muted text-muted-foreground">
                      empty
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{screen.path}</div>
              </button>
            ))}

            {blueprint.screens.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {blueprint.userFlow.nodes.some(n => n.type === 'screen')
                  ? 'Click "Import from Flow" to bring in screens from your flow diagram.'
                  : 'No screens yet. Add one to start wireframing.'}
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

          <div className="flex items-center gap-2">
            {batchProgress && (
              <span className="text-xs text-muted-foreground">
                {batchProgress.current}/{batchProgress.total}
              </span>
            )}
            {blueprint.screens.length > 0 && (
              <Button
                onClick={handleGenerateAll}
                disabled={isAiProcessing}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {isAiProcessing && batchProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating {batchProgress.current}/{batchProgress.total}...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    Generate All
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={handleAiGenerateLayout}
              disabled={isAiProcessing || !selectedScreenId}
              size="sm"
              className="gap-2 bg-gradient-to-r from-[var(--va-cyan)] to-[var(--va-green)] hover:opacity-90"
            >
              {isAiProcessing && !batchProgress ? (
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
        </div>

        {/* Tldraw Canvas */}
        <div className="flex-1 relative">
          {selectedScreenId ? (
            <Tldraw
              key={selectedScreenId}
              onMount={handleMount}
              className="!absolute !inset-0"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Layout className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {blueprint.screens.length === 0
                    ? 'Import screens from your flow or add one manually'
                    : 'Select a screen to start wireframing'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
