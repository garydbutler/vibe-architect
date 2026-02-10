'use client';

import { PrdInput } from './prd-input';
import { StoryList } from './story-list';
import { StoryDetails } from './story-details';

export function StoriesPhase() {
  return (
    <div className="h-full flex">
      {/* Left Panel - PRD Input */}
      <div className="flex-1 min-w-[300px] border-r border-border">
        <div className="h-full p-4">
          <PrdInput />
        </div>
      </div>

      {/* Middle Panel - Story List */}
      <div className="w-80 min-w-[280px] border-r border-border">
        <div className="h-full p-4">
          <StoryList />
        </div>
      </div>

      {/* Right Panel - Story Details */}
      <div className="w-80 min-w-[280px]">
        <div className="h-full p-4">
          <StoryDetails />
        </div>
      </div>
    </div>
  );
}
