'use client';

import dynamic from 'next/dynamic';

// Dynamically import WireframeCanvas to avoid SSR issues with tldraw
const WireframeCanvas = dynamic(
  () => import('./wireframe-canvas').then(mod => ({ default: mod.WireframeCanvas })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--va-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading wireframe editor...</p>
        </div>
      </div>
    ),
  }
);

export function DesignPhase() {
  return (
    <div className="h-full">
      <WireframeCanvas />
    </div>
  );
}
