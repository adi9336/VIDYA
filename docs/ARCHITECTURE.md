# Architecture

Source of truth: [VIDYA_AI_MVP_Blueprint.md](C:\Users\ADITYA GUPTA\VIDYA_AI\docs\VIDYA_AI_MVP_Blueprint.md)

## Stack

- Frontend: React-based chat UI, mobile-first
- Backend: FastAPI
- Conversation model: GPT-4o or Claude via API
- Speech-to-text: Whisper
- Text-to-speech: conversational voice provider
- Visual layer: base SVG illustrations plus selective dynamic image modifications

## Application Shape

- A student-facing tutoring app centered on one conversation at a time
- The product experience is driven primarily by prompt design and tutoring flow
- The first implementation should optimize for one strong concept journey rather than broad subject coverage

## Data Flow

- Student enters a question by text or voice
- Backend converts voice to text when needed
- Conversation service applies the tutoring prompt and returns the next guided response
- UI displays the explanation, follow-up question, and any relevant illustration
- Visual layer can surface a base illustration or a modified version depending on the current concept state

## Deployment

- MVP should favor a simple deployment path with low operational complexity
- Frontend and backend can start as separate services or be consolidated later based on the chosen implementation stack

## Open Decisions

- Whether to implement the backend as FastAPI, as described in the blueprint, or consolidate around a Next.js-native backend
- Which text-to-speech provider best supports natural Hinglish output
- Whether dynamic visual generation is included in the first shipped MVP or added immediately after the first tutoring loop is validated
