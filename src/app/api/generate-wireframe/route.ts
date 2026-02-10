import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

type ApiShape = {
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const wireframeSchema = z.object({
  shapes: z.array(z.object({
    type: z.enum(['navbar', 'sidebar', 'data-table', 'form', 'card', 'list', 'button', 'input', 'chart', 'modal', 'text', 'image', 'container']),
    label: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  })),
});

// Deterministic layout engine that positions shapes on a clean grid.
// Ignores AI-provided x/y/width/height and re-computes everything
// based on component type and logical ordering.
function layoutShapes(rawShapes: ApiShape[]): ApiShape[] {
  const W = 1024;
  const GAP = 16;

  const result: ApiShape[] = [];

  // 1. Extract and place structural elements
  const navbar = rawShapes.find(s => s.type === 'navbar');
  const sidebar = rawShapes.find(s => s.type === 'sidebar');
  const content = rawShapes.filter(s => s.type !== 'navbar' && s.type !== 'sidebar');

  let topY = 0;
  let leftX = 0;

  if (navbar) {
    result.push({ ...navbar, x: 0, y: 0, width: W, height: 56 });
    topY = 56;
  }

  if (sidebar) {
    result.push({ ...sidebar, x: 0, y: topY, width: 200, height: 712 });
    leftX = 200;
  }

  // 2. Content area with padding
  const area = {
    x: leftX + GAP,
    y: topY + GAP,
    w: W - leftX - GAP * 2,
  };

  // 3. Process content in order, grouping consecutive same-type elements
  let curY = area.y;
  let i = 0;

  while (i < content.length) {
    const shape = content[i];

    // Collect consecutive shapes of the same type
    const group: ApiShape[] = [shape];
    while (i + 1 < content.length && content[i + 1].type === shape.type) {
      group.push(content[++i]);
    }
    i++;

    switch (shape.type) {
      case 'container': {
        for (const s of group) {
          result.push({ ...s, x: area.x, y: curY, width: area.w, height: 48 });
          curY += 48 + GAP;
        }
        break;
      }

      case 'data-table':
      case 'list': {
        for (const s of group) {
          result.push({ ...s, x: area.x, y: curY, width: area.w, height: 280 });
          curY += 280 + GAP;
        }
        break;
      }

      case 'form': {
        const cols = group.length === 1 ? 1 : 2;
        const formW = cols === 1 ? area.w : Math.floor((area.w - GAP) / 2);
        const formH = 280;
        placeGrid(result, group, area.x, curY, formW, formH, cols, GAP);
        curY += (Math.ceil(group.length / cols)) * (formH + GAP);
        break;
      }

      case 'card': {
        const cols = Math.min(group.length, 3);
        const cardW = Math.floor((area.w - GAP * (cols - 1)) / cols);
        const cardH = 120;
        placeGrid(result, group, area.x, curY, cardW, cardH, cols, GAP);
        curY += (Math.ceil(group.length / cols)) * (cardH + GAP);
        break;
      }

      case 'chart': {
        const cols = Math.min(group.length, 2);
        const chartW = Math.floor((area.w - GAP * (cols - 1)) / cols);
        const chartH = 220;
        placeGrid(result, group, area.x, curY, chartW, chartH, cols, GAP);
        curY += (Math.ceil(group.length / cols)) * (chartH + GAP);
        break;
      }

      case 'input': {
        const cols = group.length === 1 ? 1 : 2;
        const inputW = cols === 1 ? Math.min(400, area.w) : Math.floor((area.w - GAP) / 2);
        const inputH = 44;
        placeGrid(result, group, area.x, curY, inputW, inputH, cols, GAP);
        curY += (Math.ceil(group.length / cols)) * (inputH + GAP);
        break;
      }

      case 'button': {
        // Right-align buttons in a single row
        const btnH = 40;
        let bx = area.x + area.w;
        for (let j = group.length - 1; j >= 0; j--) {
          const bw = Math.max(100, group[j].label.length * 9 + 32);
          bx -= bw;
          result.push({ ...group[j], x: bx, y: curY, width: bw, height: btnH });
          bx -= GAP;
        }
        curY += btnH + GAP;
        break;
      }

      case 'text': {
        for (const s of group) {
          result.push({ ...s, x: area.x, y: curY, width: area.w, height: 32 });
          curY += 32 + GAP;
        }
        break;
      }

      case 'image': {
        const cols = Math.min(group.length, 3);
        const imgW = Math.floor((area.w - GAP * (cols - 1)) / cols);
        const imgH = 180;
        placeGrid(result, group, area.x, curY, imgW, imgH, cols, GAP);
        curY += (Math.ceil(group.length / cols)) * (imgH + GAP);
        break;
      }

      case 'modal': {
        for (const s of group) {
          result.push({ ...s, x: W / 2 - 200, y: 768 / 2 - 150, width: 400, height: 300 });
        }
        break;
      }

      default: {
        for (const s of group) {
          result.push({ ...s, x: area.x, y: curY, width: area.w, height: 60 });
          curY += 60 + GAP;
        }
      }
    }
  }

  return result;
}

// Helper: place items in a grid
function placeGrid(
  result: ApiShape[],
  items: ApiShape[],
  startX: number,
  startY: number,
  itemW: number,
  itemH: number,
  cols: number,
  gap: number
) {
  for (let j = 0; j < items.length; j++) {
    const col = j % cols;
    const row = Math.floor(j / cols);
    result.push({
      ...items[j],
      x: startX + col * (itemW + gap),
      y: startY + row * (itemH + gap),
      width: itemW,
      height: itemH,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { screen, entities, stories } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const shapes = generateContextualMock(screen, entities);
      return NextResponse.json({ shapes });
    }

    const openai = createOpenAI({ apiKey });

    const storyText = stories?.length
      ? stories.map((s: { role: string; action: string; benefit: string; acceptanceCriteria?: string[] }, i: number) =>
          `${i + 1}. As a ${s.role}, I want to ${s.action}, so that ${s.benefit}${s.acceptanceCriteria?.length ? `\n   Criteria: ${s.acceptanceCriteria.join('; ')}` : ''}`
        ).join('\n')
      : 'No specific stories linked.';

    const entityText = entities?.length
      ? entities.map((e: { name: string; attributes?: { name: string; type: string }[] }) =>
          `- ${e.name}: ${e.attributes?.map((a: { name: string; type: string }) => `${a.name}(${a.type})`).join(', ') || 'no attributes'}`
        ).join('\n')
      : 'No entities defined.';

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: wireframeSchema,
      prompt: `You are a UI/UX designer choosing wireframe components for a screen. A layout engine will handle positioning automatically — focus on choosing the RIGHT components and labels.

Screen: "${screen?.name || 'Untitled'}" (path: ${screen?.path || '/'})

Linked User Stories:
${storyText}

Data Entities:
${entityText}

Generate 6-14 wireframe components. Use approximate coordinates (they will be repositioned).

CRITICAL ORDERING RULES:
1. Start with structural elements: navbar first, then optionally sidebar
2. Then section headers (container type) before their content
3. Group same-type items consecutively (e.g. all cards together, all inputs together)
4. Place action buttons (Save, Cancel, Submit, etc.) at the END

Component selection by screen purpose:
- Dashboard/overview: navbar → stat cards (3) → charts (1-2) → data-table
- List/management: navbar → sidebar → container header → input (search) → data-table → buttons (pagination)
- Form/create/edit: navbar → container header → inputs (4-6 fields) → buttons (Save, Cancel)
- Detail view: navbar → sidebar → cards (info sections) → data-table or list → buttons (Edit, Delete)
- Auth/login: navbar → container → inputs (email, password) → button (Sign In) → text (forgot password)

Use descriptive labels derived from the screen name, stories, and entities. Keep labels SHORT (1-3 words) to prevent text overflow.`,
    });

    // Apply deterministic layout to fix AI positioning
    const laidOut = layoutShapes(result.object.shapes as ApiShape[]);
    return NextResponse.json({ shapes: laidOut });
  } catch (error) {
    console.error('Error generating wireframe:', error);
    return NextResponse.json(
      { error: 'Failed to generate wireframe' },
      { status: 500 }
    );
  }
}

function generateContextualMock(
  screen: { name: string; path?: string } | undefined,
  entities: { name: string; attributes?: { name: string }[] }[] | undefined
) {
  const name = (screen?.name || '').toLowerCase();
  const entityName = entities?.[0]?.name || 'Item';

  // Dashboard / Home / Overview
  if (/dashboard|home|overview|analytics/.test(name)) {
    return [
      { type: 'navbar', label: 'Navigation Bar', x: 0, y: 0, width: 1024, height: 60 },
      { type: 'sidebar', label: 'Menu', x: 0, y: 60, width: 220, height: 708 },
      { type: 'card', label: 'Total Users', x: 244, y: 84, width: 230, height: 120 },
      { type: 'card', label: 'Revenue', x: 498, y: 84, width: 230, height: 120 },
      { type: 'card', label: 'Active Sessions', x: 752, y: 84, width: 230, height: 120 },
      { type: 'chart', label: 'Activity Over Time', x: 244, y: 228, width: 484, height: 260 },
      { type: 'chart', label: 'Distribution', x: 752, y: 228, width: 230, height: 260 },
      { type: 'data-table', label: `Recent ${entityName}s`, x: 244, y: 512, width: 738, height: 220 },
    ];
  }

  // List / Table / Manage
  if (/list|table|manage|browse|search|all\b/.test(name)) {
    return [
      { type: 'navbar', label: 'Navigation Bar', x: 0, y: 0, width: 1024, height: 60 },
      { type: 'sidebar', label: 'Filters', x: 0, y: 60, width: 220, height: 708 },
      { type: 'container', label: `${entityName} Management`, x: 244, y: 84, width: 756, height: 52 },
      { type: 'input', label: 'Search...', x: 244, y: 156, width: 400, height: 40 },
      { type: 'button', label: `Add ${entityName}`, x: 880, y: 156, width: 120, height: 40 },
      { type: 'data-table', label: `${entityName} List`, x: 244, y: 220, width: 756, height: 400 },
      { type: 'text', label: 'Showing 1-25 of 100', x: 244, y: 644, width: 200, height: 30 },
      { type: 'button', label: 'Previous', x: 800, y: 644, width: 80, height: 36 },
      { type: 'button', label: 'Next', x: 900, y: 644, width: 80, height: 36 },
    ];
  }

  // Form / Create / Edit / Settings
  if (/form|create|edit|settings|profile|config|new\b|add\b/.test(name)) {
    return [
      { type: 'navbar', label: 'Navigation Bar', x: 0, y: 0, width: 1024, height: 60 },
      { type: 'container', label: screen?.name || 'Form', x: 212, y: 100, width: 600, height: 580 },
      { type: 'text', label: screen?.name || 'Edit Details', x: 244, y: 120, width: 400, height: 36 },
      { type: 'input', label: 'Name', x: 244, y: 180, width: 536, height: 44 },
      { type: 'input', label: 'Email', x: 244, y: 248, width: 536, height: 44 },
      { type: 'input', label: 'Description', x: 244, y: 316, width: 536, height: 100 },
      { type: 'input', label: 'Category', x: 244, y: 440, width: 260, height: 44 },
      { type: 'input', label: 'Status', x: 520, y: 440, width: 260, height: 44 },
      { type: 'button', label: 'Cancel', x: 580, y: 520, width: 90, height: 40 },
      { type: 'button', label: 'Save', x: 690, y: 520, width: 90, height: 40 },
    ];
  }

  // Login / Auth
  if (/login|sign.?in|auth|register|sign.?up/.test(name)) {
    return [
      { type: 'navbar', label: 'App Logo', x: 0, y: 0, width: 1024, height: 60 },
      { type: 'container', label: 'Login Form', x: 312, y: 140, width: 400, height: 420 },
      { type: 'text', label: 'Welcome Back', x: 362, y: 170, width: 300, height: 40 },
      { type: 'text', label: 'Sign in to continue', x: 362, y: 210, width: 300, height: 24 },
      { type: 'input', label: 'Email Address', x: 362, y: 268, width: 300, height: 44 },
      { type: 'input', label: 'Password', x: 362, y: 336, width: 300, height: 44 },
      { type: 'button', label: 'Sign In', x: 362, y: 410, width: 300, height: 44 },
      { type: 'text', label: 'Forgot password?', x: 412, y: 470, width: 200, height: 24 },
    ];
  }

  // Detail / View / Single item
  if (/detail|view|single|profile|page/.test(name)) {
    return [
      { type: 'navbar', label: 'Navigation Bar', x: 0, y: 0, width: 1024, height: 60 },
      { type: 'sidebar', label: 'Navigation', x: 0, y: 60, width: 220, height: 708 },
      { type: 'card', label: `${entityName} Info`, x: 244, y: 84, width: 738, height: 180 },
      { type: 'container', label: 'Details', x: 244, y: 288, width: 480, height: 400 },
      { type: 'card', label: 'Related Data', x: 748, y: 288, width: 234, height: 190 },
      { type: 'card', label: 'Actions', x: 748, y: 502, width: 234, height: 186 },
      { type: 'button', label: 'Edit', x: 772, y: 520, width: 90, height: 36 },
      { type: 'button', label: 'Delete', x: 872, y: 520, width: 90, height: 36 },
    ];
  }

  // Error page
  if (/error|404|500|not.?found/.test(name)) {
    return [
      { type: 'navbar', label: 'Navigation Bar', x: 0, y: 0, width: 1024, height: 60 },
      { type: 'container', label: 'Error Container', x: 262, y: 180, width: 500, height: 300 },
      { type: 'text', label: 'Something went wrong', x: 312, y: 220, width: 400, height: 48 },
      { type: 'text', label: 'The page you are looking for could not be found.', x: 312, y: 290, width: 400, height: 30 },
      { type: 'button', label: 'Go Home', x: 432, y: 370, width: 160, height: 44 },
    ];
  }

  // Default: generic layout
  return [
    { type: 'navbar', label: 'Navigation Bar', x: 0, y: 0, width: 1024, height: 60 },
    { type: 'sidebar', label: 'Sidebar', x: 0, y: 60, width: 220, height: 708 },
    { type: 'container', label: 'Main Content', x: 244, y: 84, width: 756, height: 52 },
    { type: 'card', label: `${screen?.name || 'Screen'} Header`, x: 244, y: 160, width: 756, height: 100 },
    { type: 'data-table', label: `${entityName} Table`, x: 244, y: 284, width: 756, height: 300 },
    { type: 'button', label: 'Action', x: 880, y: 608, width: 120, height: 40 },
  ];
}
