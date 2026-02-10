import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const flowSchema = z.object({
  nodes: z.array(z.object({
    type: z.enum(['start', 'screen', 'action', 'decision', 'end']),
    label: z.string(),
    description: z.string().nullable(),
    linkedStoryIds: z.array(z.string()),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
  })),
  edges: z.array(z.object({
    source: z.string().describe('Source node index (as string)'),
    target: z.string().describe('Target node index (as string)'),
    label: z.string().nullable(),
    type: z.enum(['navigation', 'conditional', 'action']).nullable(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const { stories } = await request.json();

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key configured
      return NextResponse.json(generateMockFlow(stories));
    }

    const openai = createOpenAI({ apiKey });

    const storyText = stories.map((s: { role: string; action: string; benefit: string }, i: number) => 
      `${i + 1}. As a ${s.role}, I want to ${s.action}, so that ${s.benefit}`
    ).join('\n');

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: flowSchema,
      prompt: `You are a UX architect. Create a user flow diagram based on these MVP user stories.

User Stories:
${storyText}

Create a logical flow with:
1. A "start" node
2. Screen nodes for main pages/views
3. Action nodes for user actions
4. Decision nodes for branching logic
5. An "end" node

Position nodes in a top-to-bottom, left-to-right layout:
- Start node at (400, 50)
- Each row ~150px apart vertically
- Nodes spread horizontally ~200px apart
- Use realistic screen names (Dashboard, Settings, etc.)

Connect nodes with appropriate edge types (navigation, conditional, action).
Reference story indices in linkedStoryIds (as "0", "1", etc.).`,
    });

    // Assign IDs to nodes
    const nodesWithIds = result.object.nodes.map((node, index) => ({
      ...node,
      id: `node-${index}`,
    }));

    // Update edges to use actual node IDs
    const edgesWithIds = result.object.edges.map((edge, index) => ({
      ...edge,
      id: `edge-${index}`,
      source: `node-${parseInt(edge.source)}`,
      target: `node-${parseInt(edge.target)}`,
    }));

    return NextResponse.json({
      nodes: nodesWithIds,
      edges: edgesWithIds,
    });
  } catch (error) {
    console.error('Error generating flow:', error);
    return NextResponse.json(
      { error: 'Failed to generate flow' },
      { status: 500 }
    );
  }
}

// Mock flow generator
function generateMockFlow(stories: { id: string }[]) {
  const nodes = [
    { id: 'node-0', type: 'start' as const, label: 'Start', position: { x: 400, y: 50 }, linkedStoryIds: [] },
    { id: 'node-1', type: 'screen' as const, label: 'Login Page', position: { x: 400, y: 150 }, linkedStoryIds: stories.slice(0, 1).map(s => s.id) },
    { id: 'node-2', type: 'action' as const, label: 'Authenticate', position: { x: 400, y: 250 }, linkedStoryIds: [] },
    { id: 'node-3', type: 'decision' as const, label: 'Authorized?', position: { x: 400, y: 350 }, linkedStoryIds: [] },
    { id: 'node-4', type: 'screen' as const, label: 'Dashboard', position: { x: 250, y: 500 }, linkedStoryIds: stories.slice(1, 3).map(s => s.id) },
    { id: 'node-5', type: 'screen' as const, label: 'Error Page', position: { x: 550, y: 500 }, linkedStoryIds: [] },
    { id: 'node-6', type: 'screen' as const, label: 'Settings', position: { x: 100, y: 650 }, linkedStoryIds: stories.slice(3).map(s => s.id) },
    { id: 'node-7', type: 'screen' as const, label: 'Main Feature', position: { x: 400, y: 650 }, linkedStoryIds: stories.map(s => s.id) },
    { id: 'node-8', type: 'end' as const, label: 'End', position: { x: 400, y: 800 }, linkedStoryIds: [] },
  ];

  const edges = [
    { id: 'edge-0', source: 'node-0', target: 'node-1', type: 'navigation' as const },
    { id: 'edge-1', source: 'node-1', target: 'node-2', label: 'Submit', type: 'action' as const },
    { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'navigation' as const },
    { id: 'edge-3', source: 'node-3', target: 'node-4', label: 'Yes', type: 'conditional' as const },
    { id: 'edge-4', source: 'node-3', target: 'node-5', label: 'No', type: 'conditional' as const },
    { id: 'edge-5', source: 'node-4', target: 'node-6', label: 'Settings', type: 'navigation' as const },
    { id: 'edge-6', source: 'node-4', target: 'node-7', label: 'Continue', type: 'navigation' as const },
    { id: 'edge-7', source: 'node-7', target: 'node-8', type: 'navigation' as const },
  ];

  return { nodes, edges };
}
