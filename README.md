# VIDYA_AI

Vidya AI is a Motion-chapter MVP for a Hinglish-first conversational tutor aimed at Class 9 students.

The repo now includes a working `Next.js` app shell, typed API routes, Motion content packs, base SVG illustrations, a tutoring orchestrator, and an offline `autoresearch`-style research loop for improving prompts and lesson flows.

## Current Product Docs

- Full blueprint: [docs/VIDYA_AI_MVP_Blueprint.md](C:\Users\ADITYA GUPTA\VIDYA_AI\docs\VIDYA_AI_MVP_Blueprint.md)
- PRD summary: [docs/PRD.md](C:\Users\ADITYA GUPTA\VIDYA_AI\docs\PRD.md)
- Architecture summary: [docs/ARCHITECTURE.md](C:\Users\ADITYA GUPTA\VIDYA_AI\docs\ARCHITECTURE.md)

## Run It

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm test
npm run build
node scripts/research-runner.js
```

## LiveKit Realtime Voice

This project now includes a LiveKit realtime voice path:

- Frontend token route: `src/app/api/livekit/token/route.ts`
- LiveKit client UI: `src/features/tutor/client/TutorExperience.tsx`
- Python agent worker: `agents/livekit/vidya_agent.py`
- Setup guide: [docs/LIVEKIT.md](C:\Users\ADITYA GUPTA\VIDYA_AI\docs\LIVEKIT.md)

Required environment variables:

```bash
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
OPENAI_API_KEY=
```

## Core Files

- `AGENTS.md` - repo-specific instructions for Codex and other coding agents
- `RULES.md` - non-negotiable engineering and safety rules
- `WORKING-CONTEXT.md` - active sprint context, assumptions, and next actions
- `.mcp.json` - MCP server configuration placeholder
- `.env.example` - environment variable template
- `research/` - offline prompt and lesson iteration loop inspired by `karpathy/autoresearch`

## Project Layout

```text
.
|-- AGENTS.md
|-- RULES.md
|-- WORKING-CONTEXT.md
|-- README.md
|-- .env.example
|-- .gitignore
|-- .mcp.json
|-- docs/
|-- scripts/
|-- src/
|   |-- app/
|   |-- core/
|   |-- features/
|   |-- lib/
|   `-- types/
`-- tests/
    |-- integration/
    `-- unit/
```

## Next Steps

1. Replace mock provider adapters with real model, STT, and TTS integrations.
2. Expand the tutoring engine from deterministic concept packs to structured model outputs.
3. Add real student-session telemetry and acceptance testing.
4. Use `research/` to iterate on Motion prompts before expanding to more chapters.
