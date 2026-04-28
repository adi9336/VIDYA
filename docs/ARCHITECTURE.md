# Architecture

Source of truth: [VIDYA_AI_MVP_Blueprint.md](C:\Users\ADITYA GUPTA\VIDYA_AI\docs\VIDYA_AI_MVP_Blueprint.md)

## Stack

- Frontend: React-based chat UI, mobile-first
- Backend: FastAPI
- Conversation model: GPT-4o or Claude via API
- Speech-to-text: Whisper
- Text-to-speech: conversational voice provider
- Visual layer: GPT-generated Motion diagrams with local cache and static SVG fallback

## Application Shape

- A student-facing senior-buddy app centered on one realtime conversation at a time
- The product experience is driven primarily by prompt design, intent routing, and voice interaction quality
- The first implementation should optimize for natural mode switching through a typed supervisor: buddy, tutor, coach, clarifier, safety, and specialist packs
- Motion is the first specialist content pack, not the default conversation mode

## Data Flow

- Student enters a message by text or voice
- Intent routing creates a validated turn plan before response generation: casual buddy talk, tutoring, study coaching, clarification, safety handling, or a specialist subject turn
- Backend converts voice to text when needed
- Conversation service applies the senior-buddy system prompt and the selected mode instructions
- UI displays the reply, realtime transcript, and any relevant teaching artifact
- Visual layer only surfaces generated or fallback specialist illustrations when a Motion learning question needs them

## Deployment

- MVP should favor a simple deployment path with low operational complexity
- Frontend and backend can start as separate services or be consolidated later based on the chosen implementation stack

## Open Decisions

- Whether to implement the backend as FastAPI, as described in the blueprint, or consolidate around a Next.js-native backend
- Which text-to-speech provider best supports natural Hinglish output
- Whether generated visual cache should move from local filesystem to object storage for production
