import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Install zod if not present
// npm install zod

const storySchema = z.object({
  stories: z.array(z.object({
    role: z.string().describe('The user role (e.g., "user", "admin", "developer")'),
    action: z.string().describe('What the user wants to do'),
    benefit: z.string().describe('Why they want to do it / the benefit'),
    acceptanceCriteria: z.array(z.string()).describe('List of acceptance criteria'),
    priority: z.enum(['P0', 'P1', 'P2', 'P3']).describe('Priority level'),
    isMvp: z.boolean().describe('Whether this story is part of MVP scope'),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const { prd } = await request.json();

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key configured
      return NextResponse.json({
        stories: generateMockStories(prd),
      });
    }

    const openai = createOpenAI({ apiKey });

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: storySchema,
      prompt: `You are a product analyst. Extract user stories from the following PRD document.

For each distinct feature or requirement, create a user story in the format:
- Role: Who is the user?
- Action: What do they want to do?
- Benefit: Why do they want to do it?
- Acceptance Criteria: List 2-4 specific, testable criteria
- Priority: P0 (critical), P1 (high), P2 (medium), P3 (low)
- isMvp: Is this essential for MVP? (be selective, ~30-50% of stories)

PRD Document:
${prd}

Extract all user stories, being comprehensive but avoiding duplicates.`,
    });

    return NextResponse.json({
      stories: result.object.stories.map(story => ({
        ...story,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });
  } catch (error) {
    console.error('Error extracting stories:', error);
    return NextResponse.json(
      { error: 'Failed to extract stories' },
      { status: 500 }
    );
  }
}

// Mock story generator for when API key is not configured
function generateMockStories(prd: string) {
  const lines = prd.split('\n').filter(l => l.trim());
  const storyCount = Math.min(Math.max(3, Math.floor(lines.length / 20)), 8);
  
  const roles = ['user', 'admin', 'developer', 'manager'];
  const mockStories = [];

  for (let i = 0; i < storyCount; i++) {
    mockStories.push({
      id: crypto.randomUUID(),
      role: roles[i % roles.length],
      action: `complete feature ${i + 1} from the PRD`,
      benefit: `I can achieve the project goals`,
      acceptanceCriteria: [
        `Feature ${i + 1} is fully functional`,
        `All edge cases are handled`,
        `Performance meets requirements`,
      ],
      priority: i < 2 ? 'P0' : i < 4 ? 'P1' : 'P2',
      isMvp: i < 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return mockStories;
}
