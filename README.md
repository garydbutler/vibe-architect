# 🏗️ Vibe Architect

**The Blueprint Engine for AI-Powered Development**

Vibe Architect is a visual planning environment that bridges the gap between human product intent and AI execution. It transforms PRDs into structured Semantic JSON Blueprints that AI coding agents can use to build exactly what you designed.

![Vibe Architect](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![React Flow](https://img.shields.io/badge/React_Flow-Diagrams-purple)
![tldraw](https://img.shields.io/badge/tldraw-Wireframes-cyan)

## ✨ Features

### Phase 1: Story Hub
- **PRD Ingestion** - Paste or upload your Product Requirements Document
- **AI Story Extraction** - Automatically parse user stories from unstructured text
- **MVP Toggling** - Mark stories as MVP scope to focus AI generation
- **Story Management** - Edit roles, actions, benefits, and acceptance criteria

### Phase 2: Flow Canvas
- **User Flow Diagrams** - Visual flowcharts with screens, actions, and decisions
- **ERD Modeling** - Entity relationship diagrams for your data model
- **AI Generation** - Auto-generate flows and schemas from MVP stories
- **Interactive Editing** - Drag, connect, and modify nodes in real-time

### Phase 3: Wireframe Wizard
- **Low-Fi Canvas** - Sketch screen layouts without pixel-perfect pressure
- **Semantic Components** - Navbar, Sidebar, Data Table, Form, etc.
- **AI Layout Generation** - Generate initial layouts based on data requirements
- **Multi-Screen Support** - Design multiple screens linked to your flow

### Phase 4: Blueprint Export
- **Semantic JSON** - Structured output for AI coding agents
- **Complete Package** - Stories, routes, schema, and screen definitions
- **Story Traceability** - Track which stories each screen fulfills
- **Copy & Download** - Easy export for immediate use

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/your-repo/vibe-architect.git
cd vibe-architect
npm install

# Set up environment
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start architecting.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict)
- **State**: Zustand with persistence
- **Diagrams**: React Flow (@xyflow/react)
- **Wireframes**: tldraw
- **AI**: Vercel AI SDK + OpenAI
- **UI**: shadcn/ui + Tailwind CSS
- **Theme**: Dark mode first (VS Code aesthetic)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/               # AI endpoints
│   │   ├── extract-stories/
│   │   ├── generate-flow/
│   │   ├── generate-erd/
│   │   └── generate-wireframe/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/            # Navigation, Header
│   ├── phases/
│   │   ├── stories/       # PRD input, story list
│   │   ├── architecture/  # Flow & ERD canvas
│   │   ├── design/        # Wireframe wizard
│   │   └── export/        # JSON export
│   └── ui/                # shadcn components
├── store/
│   └── blueprint-store.ts # Zustand global state
└── types/
    └── blueprint.ts       # TypeScript definitions
```

## 🎨 The Blueprint Format

Vibe Architect outputs a Semantic JSON Blueprint:

```json
{
  "manifest": {
    "name": "My App",
    "version": "1.0.0",
    "mvpStoryCount": 5,
    "screenCount": 4,
    "entityCount": 3
  },
  "stories": {
    "mvpScope": [...],
    "backlog": [...]
  },
  "routes": {
    "routes": [...],
    "navigation": [...]
  },
  "db_schema": {
    "entities": [...],
    "relationships": [...]
  },
  "screens": [...]
}
```

Feed this to Claude Code, Cursor, or any AI coding agent to maintain architectural context throughout development.

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | No* |

*Without an API key, the app works with mock data for testing.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use for personal and commercial projects.

---

**Built with 💜 for the vibe coding community**

*From unstructured "vibe coding" to structured "Vibe Architecting"*
