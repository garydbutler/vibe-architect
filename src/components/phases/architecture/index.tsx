'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlowCanvas } from './flow-canvas';
import { ErdCanvas } from './erd-canvas';
import { GitBranch, Database } from 'lucide-react';

export function ArchitecturePhase() {
  const [activeTab, setActiveTab] = useState<'flow' | 'erd'>('flow');

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'flow' | 'erd')} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4 py-2">
          <TabsList className="bg-secondary/30">
            <TabsTrigger value="flow" className="gap-2 data-[state=active]:bg-[var(--va-blue)]/20">
              <GitBranch className="w-4 h-4" />
              User Flows
            </TabsTrigger>
            <TabsTrigger value="erd" className="gap-2 data-[state=active]:bg-[var(--va-purple)]/20">
              <Database className="w-4 h-4" />
              Data Model (ERD)
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="flow" className="flex-1 m-0 data-[state=inactive]:hidden">
          <FlowCanvas />
        </TabsContent>

        <TabsContent value="erd" className="flex-1 m-0 data-[state=inactive]:hidden">
          <ErdCanvas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
