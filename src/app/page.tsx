'use client';

import { NavigationSidebar } from '@/components/layout/navigation-sidebar';
import { Header } from '@/components/layout/header';
import { StoriesPhase } from '@/components/phases/stories';
import { ArchitecturePhase } from '@/components/phases/architecture';
import { DesignPhase } from '@/components/phases/design';
import { ExportPhase } from '@/components/phases/export';
import { useBlueprintStore } from '@/store/blueprint-store';

export default function Home() {
  const { currentPhase } = useBlueprintStore();

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Navigation Sidebar */}
      <NavigationSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Phase Content */}
        <main className="flex-1 overflow-hidden">
          {currentPhase === 'stories' && <StoriesPhase />}
          {currentPhase === 'architecture' && <ArchitecturePhase />}
          {currentPhase === 'design' && <DesignPhase />}
          {currentPhase === 'export' && <ExportPhase />}
        </main>
      </div>
    </div>
  );
}
