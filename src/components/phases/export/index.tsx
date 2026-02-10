'use client';

import { useState } from 'react';
import { useBlueprintStore } from '@/store/blueprint-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  FileJson,
  Copy,
  Check,
  Package,
  GitBranch,
  Database,
  Layout,
  BookOpen,
  Sparkles,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import type { ExportManifest } from '@/types/blueprint';

export function ExportPhase() {
  const { blueprint, getMvpStories } = useBlueprintStore();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const mvpStories = getMvpStories();

  const generateManifest = (): ExportManifest => ({
    name: blueprint.name,
    version: blueprint.version,
    generatedAt: new Date().toISOString(),
    mvpStoryCount: mvpStories.length,
    screenCount: blueprint.screens.length,
    entityCount: blueprint.dataModel.entities.length,
    files: [
      'manifest.json',
      'stories.json',
      'routes.json',
      'db_schema.json',
      ...blueprint.screens.map(s => `screens/${s.path.replace(/\//g, '_')}.json`),
    ],
  });

  const generateRoutesJson = () => ({
    routes: blueprint.userFlow.nodes
      .filter(n => n.type === 'screen')
      .map(node => ({
        id: node.id,
        path: `/${node.label.toLowerCase().replace(/\s+/g, '-')}`,
        name: node.label,
        linkedStoryIds: node.linkedStoryIds,
      })),
    navigation: blueprint.userFlow.edges.map(edge => ({
      from: edge.source,
      to: edge.target,
      action: edge.label || 'navigate',
    })),
  });

  const generateDbSchema = () => ({
    entities: blueprint.dataModel.entities.map(entity => ({
      name: entity.name,
      attributes: entity.attributes.map(attr => ({
        name: attr.name,
        type: attr.type,
        required: attr.required,
        primaryKey: attr.isPrimaryKey || false,
        foreignKey: attr.isForeignKey ? attr.referenceTo : null,
      })),
    })),
    relationships: blueprint.dataModel.relationships.map(rel => ({
      source: blueprint.dataModel.entities.find(e => e.id === rel.sourceEntity)?.name,
      target: blueprint.dataModel.entities.find(e => e.id === rel.targetEntity)?.name,
      type: rel.type,
    })),
  });

  const generateStoriesJson = () => ({
    mvpScope: mvpStories.map(story => ({
      id: story.id,
      userStory: `As a ${story.role}, I want to ${story.action}, so that ${story.benefit}`,
      priority: story.priority,
      acceptanceCriteria: story.acceptanceCriteria,
    })),
    backlog: blueprint.stories.filter(s => !s.isMvp).map(story => ({
      id: story.id,
      userStory: `As a ${story.role}, I want to ${story.action}, so that ${story.benefit}`,
      priority: story.priority,
    })),
  });

  const generateScreenJson = (screenId: string) => {
    const screen = blueprint.screens.find(s => s.id === screenId);
    if (!screen) return null;

    return {
      id: screen.id,
      name: screen.name,
      path: screen.path,
      linkedStoryIds: screen.linkedStoryIds,
      components: screen.components.map(comp => ({
        type: comp.type,
        label: comp.label,
        semanticType: comp.type,
        linkedEntityId: comp.linkedEntityId,
        props: comp.props,
      })),
    };
  };

  const generateScreensJson = () => ({
    screens: blueprint.screens.map(screen => ({
      id: screen.id,
      name: screen.name,
      path: screen.path,
      description: screen.description,
      linkedStoryIds: screen.linkedStoryIds,
      linkedFlowNodeId: screen.linkedFlowNodeId,
      components: screen.components.map(comp => ({
        type: comp.type,
        label: comp.label,
        semanticType: comp.type,
        linkedEntityId: comp.linkedEntityId,
        props: comp.props,
      })),
    })),
  });

  const handleCopy = (section: string, content: object) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const zip: Record<string, unknown> = {
      'manifest.json': generateManifest(),
      'stories.json': generateStoriesJson(),
      'routes.json': generateRoutesJson(),
      'db_schema.json': generateDbSchema(),
    };

    // Add screen files
    blueprint.screens.forEach(screen => {
      const screenJson = generateScreenJson(screen.id);
      if (screenJson) {
        zip[`screens/${screen.path.replace(/\//g, '_')}.json`] = screenJson;
      }
    });

    // Create a combined JSON file for simplicity (in real app, use JSZip)
    const fullBlueprint = {
      ...zip,
      screens: blueprint.screens.map(s => generateScreenJson(s.id)),
    };

    const blob = new Blob([JSON.stringify(fullBlueprint, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprint.name.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Blueprint downloaded!', {
      description: 'Your semantic JSON blueprint is ready for AI coding agents.',
    });
  };

  const stats = [
    { label: 'MVP Stories', value: mvpStories.length, icon: BookOpen, color: 'var(--va-orange)' },
    { label: 'Flow Nodes', value: blueprint.userFlow.nodes.length, icon: GitBranch, color: 'var(--va-blue)' },
    { label: 'Data Entities', value: blueprint.dataModel.entities.length, icon: Database, color: 'var(--va-purple)' },
    { label: 'Screens', value: blueprint.screens.length, icon: Layout, color: 'var(--va-cyan)' },
  ];

  return (
    <div className="h-full flex">
      {/* Left Panel - Summary */}
      <div className="w-80 border-r border-border p-4 flex flex-col">
        <Card className="mb-4 bg-gradient-to-br from-[var(--va-blue)]/10 to-[var(--va-purple)]/10 border-[var(--va-blue)]/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--va-blue)]" />
              Blueprint Ready
            </CardTitle>
            <CardDescription>
              Your semantic JSON blueprint is ready for export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label}
                    className="p-2 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3 h-3" style={{ color: stat.color }} />
                      <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="text-lg font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleDownload}
          size="lg"
          className="w-full gap-2 bg-gradient-to-r from-[var(--va-green)] to-[var(--va-cyan)] hover:opacity-90 mb-4"
        >
          <Download className="w-5 h-5" />
          Download Blueprint
        </Button>

        <Separator className="my-4" />

        <div className="flex-1">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Export Files
          </h4>
          <ScrollArea className="h-48">
            <div className="space-y-1 text-xs font-mono">
              <div className="p-2 rounded bg-secondary/30">manifest.json</div>
              <div className="p-2 rounded bg-secondary/30">stories.json</div>
              <div className="p-2 rounded bg-secondary/30">routes.json</div>
              <div className="p-2 rounded bg-secondary/30">db_schema.json</div>
              {blueprint.screens.map(screen => (
                <div key={screen.id} className="p-2 rounded bg-secondary/30">
                  screens/{screen.path.replace(/\//g, '_')}.json
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[var(--va-purple)]/10 border border-[var(--va-purple)]/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[var(--va-purple)]" />
            <span className="text-xs font-medium">AI-Ready Format</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            This blueprint is optimized for AI coding agents like Claude Code, 
            Cursor, and similar tools. Feed it directly to maintain architectural context.
          </p>
        </div>
      </div>

      {/* Right Panel - JSON Preview */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="manifest" className="h-full flex flex-col">
          <TabsList className="bg-secondary/30 mb-4">
            <TabsTrigger value="manifest">Manifest</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="schema">DB Schema</TabsTrigger>
            <TabsTrigger value="screens">Screens</TabsTrigger>
          </TabsList>

          <div className="flex-1 relative">
            {(['manifest', 'stories', 'routes', 'schema', 'screens'] as const).map((tab) => {
              const content = tab === 'manifest' ? generateManifest()
                : tab === 'stories' ? generateStoriesJson()
                : tab === 'routes' ? generateRoutesJson()
                : tab === 'screens' ? generateScreensJson()
                : generateDbSchema();

              return (
                <TabsContent key={tab} value={tab} className="absolute inset-0 m-0">
                  <Card className="h-full flex flex-col border-border/50">
                    <CardHeader className="pb-2 flex-row items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-[var(--va-cyan)]" />
                        {tab}.json
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(tab, content)}
                        className="gap-2 h-8"
                      >
                        {copiedSection === tab ? (
                          <>
                            <Check className="w-4 h-4 text-[var(--va-green)]" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                        <pre className="text-xs font-mono text-muted-foreground p-4 bg-secondary/20 rounded-lg overflow-x-auto">
                          {JSON.stringify(content, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
