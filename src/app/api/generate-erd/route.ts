import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const erdSchema = z.object({
  entities: z.array(z.object({
    name: z.string().describe('PascalCase entity name'),
    attributes: z.array(z.object({
      name: z.string().describe('camelCase attribute name'),
      type: z.enum(['string', 'number', 'boolean', 'date', 'reference', 'array']),
      required: z.boolean(),
      isPrimaryKey: z.boolean().optional(),
      isForeignKey: z.boolean().optional(),
      referenceTo: z.string().optional().describe('Referenced entity name if foreign key'),
    })),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
  })),
  relationships: z.array(z.object({
    sourceEntity: z.string().describe('Source entity index (as string)'),
    targetEntity: z.string().describe('Target entity index (as string)'),
    type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
    label: z.string().optional(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const { stories } = await request.json();

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key configured
      return NextResponse.json(generateMockErd(stories));
    }

    const openai = createOpenAI({ apiKey });

    const storyText = stories.map((s: { role: string; action: string; benefit: string }, i: number) => 
      `${i + 1}. As a ${s.role}, I want to ${s.action}, so that ${s.benefit}`
    ).join('\n');

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: erdSchema,
      prompt: `You are a database architect. Design a data model (ERD) based on these MVP user stories.

User Stories:
${storyText}

Create entities with:
1. PascalCase names (User, Post, Comment, etc.)
2. Appropriate attributes with types
3. Every entity needs an 'id' (string, required, isPrimaryKey: true)
4. Add 'createdAt' and 'updatedAt' (date) where appropriate
5. Use foreign keys to reference other entities

Position entities in a grid layout:
- Start at (100, 100)
- Space entities ~300px apart horizontally
- Space rows ~250px apart vertically
- Max 3 entities per row

Define relationships between entities (one-to-one, one-to-many, many-to-many).
Reference entity indices in sourceEntity/targetEntity.`,
    });

    // Assign IDs to entities
    const entitiesWithIds = result.object.entities.map((entity, index) => ({
      ...entity,
      id: `entity-${index}`,
    }));

    // Update relationships to use actual entity IDs
    const relationshipsWithIds = result.object.relationships.map((rel, index) => ({
      ...rel,
      id: `rel-${index}`,
      sourceEntity: `entity-${parseInt(rel.sourceEntity)}`,
      targetEntity: `entity-${parseInt(rel.targetEntity)}`,
    }));

    return NextResponse.json({
      entities: entitiesWithIds,
      relationships: relationshipsWithIds,
    });
  } catch (error) {
    console.error('Error generating ERD:', error);
    return NextResponse.json(
      { error: 'Failed to generate ERD' },
      { status: 500 }
    );
  }
}

// Mock ERD generator
function generateMockErd(stories: unknown[]) {
  const entities = [
    {
      id: 'entity-0',
      name: 'User',
      position: { x: 100, y: 100 },
      attributes: [
        { name: 'id', type: 'string' as const, required: true, isPrimaryKey: true },
        { name: 'email', type: 'string' as const, required: true },
        { name: 'name', type: 'string' as const, required: true },
        { name: 'passwordHash', type: 'string' as const, required: true },
        { name: 'role', type: 'string' as const, required: true },
        { name: 'createdAt', type: 'date' as const, required: true },
        { name: 'updatedAt', type: 'date' as const, required: true },
      ],
    },
    {
      id: 'entity-1',
      name: 'Project',
      position: { x: 400, y: 100 },
      attributes: [
        { name: 'id', type: 'string' as const, required: true, isPrimaryKey: true },
        { name: 'name', type: 'string' as const, required: true },
        { name: 'description', type: 'string' as const, required: false },
        { name: 'ownerId', type: 'reference' as const, required: true, isForeignKey: true, referenceTo: 'User' },
        { name: 'status', type: 'string' as const, required: true },
        { name: 'createdAt', type: 'date' as const, required: true },
        { name: 'updatedAt', type: 'date' as const, required: true },
      ],
    },
    {
      id: 'entity-2',
      name: 'Task',
      position: { x: 700, y: 100 },
      attributes: [
        { name: 'id', type: 'string' as const, required: true, isPrimaryKey: true },
        { name: 'title', type: 'string' as const, required: true },
        { name: 'description', type: 'string' as const, required: false },
        { name: 'projectId', type: 'reference' as const, required: true, isForeignKey: true, referenceTo: 'Project' },
        { name: 'assigneeId', type: 'reference' as const, required: false, isForeignKey: true, referenceTo: 'User' },
        { name: 'priority', type: 'string' as const, required: true },
        { name: 'status', type: 'string' as const, required: true },
        { name: 'dueDate', type: 'date' as const, required: false },
        { name: 'createdAt', type: 'date' as const, required: true },
      ],
    },
    {
      id: 'entity-3',
      name: 'Comment',
      position: { x: 250, y: 350 },
      attributes: [
        { name: 'id', type: 'string' as const, required: true, isPrimaryKey: true },
        { name: 'content', type: 'string' as const, required: true },
        { name: 'taskId', type: 'reference' as const, required: true, isForeignKey: true, referenceTo: 'Task' },
        { name: 'authorId', type: 'reference' as const, required: true, isForeignKey: true, referenceTo: 'User' },
        { name: 'createdAt', type: 'date' as const, required: true },
      ],
    },
  ];

  const relationships = [
    { id: 'rel-0', sourceEntity: 'entity-0', targetEntity: 'entity-1', type: 'one-to-many' as const, label: 'owns' },
    { id: 'rel-1', sourceEntity: 'entity-1', targetEntity: 'entity-2', type: 'one-to-many' as const, label: 'contains' },
    { id: 'rel-2', sourceEntity: 'entity-0', targetEntity: 'entity-2', type: 'one-to-many' as const, label: 'assigned to' },
    { id: 'rel-3', sourceEntity: 'entity-2', targetEntity: 'entity-3', type: 'one-to-many' as const, label: 'has' },
    { id: 'rel-4', sourceEntity: 'entity-0', targetEntity: 'entity-3', type: 'one-to-many' as const, label: 'authored by' },
  ];

  return { entities, relationships };
}
