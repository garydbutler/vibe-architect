import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { screen, entities, stories } = await request.json();

    // For now, return a mock wireframe layout
    // This would be enhanced with actual AI generation
    const shapes = generateMockWireframe(screen, entities);

    return NextResponse.json({ shapes });
  } catch (error) {
    console.error('Error generating wireframe:', error);
    return NextResponse.json(
      { error: 'Failed to generate wireframe' },
      { status: 500 }
    );
  }
}

function generateMockWireframe(screen: { name: string }, entities: { name: string }[]) {
  // Generate a basic layout with navbar, sidebar, and content area
  return [
    {
      type: 'navbar',
      label: 'Navigation Bar',
      x: 0,
      y: 0,
      width: 800,
      height: 60,
    },
    {
      type: 'sidebar',
      label: 'Sidebar',
      x: 0,
      y: 60,
      width: 200,
      height: 500,
    },
    {
      type: 'container',
      label: 'Main Content',
      x: 220,
      y: 80,
      width: 560,
      height: 460,
    },
    {
      type: 'card',
      label: `${screen?.name || 'Screen'} Header`,
      x: 240,
      y: 100,
      width: 520,
      height: 80,
    },
    {
      type: 'data-table',
      label: entities?.[0]?.name ? `${entities[0].name} List` : 'Data Table',
      x: 240,
      y: 200,
      width: 520,
      height: 300,
    },
  ];
}
