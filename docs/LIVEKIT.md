# LiveKit Integration

Vidya AI now has a LiveKit realtime voice path for an adaptive buddy/tutor experience.

## What Was Fetched From The Reference Repo

The linked repo at `C:\Users\ADITYA GUPTA\agents-assignment` is the LiveKit Agents Python SDK repo. The important files for this project are:

- `examples/voice_agents/basic_agent.py`: primary reference for a realtime voice agent worker.
- `examples/voice_agents/push_to_talk.py`: future reference if we need manual start/end-turn RPC.
- `livekit-agents/README.md`: minimal `AgentSession` and OpenAI Realtime pattern.

## Architecture

- `src/app/api/livekit/token/route.ts` creates short-lived LiveKit room tokens server-side.
- `src/features/tutor/client/TutorExperience.tsx` connects the browser to LiveKit using `@livekit/components-react`.
- `agents/livekit/vidya_agent.py` runs a Python LiveKit agent participant that listens and replies in realtime.
- The worker prompt routes behavior between buddy mode, tutor mode, study coach mode, clarifier mode, safety mode, and a Motion specialist mode.

## Agent Behavior

Vidya defaults to a casual Hinglish buddy. It should not force Physics, Motion, or teaching into normal conversation.

The agent switches modes based on the student's intent:

- Buddy mode: greetings, casual talk, motivation, normal conversation.
- Tutor mode: explanations, solving, revision, answer checking.
- Study coach mode: focus, timetable, exam stress, procrastination.
- Clarifier mode: one short question when the request is unclear.
- Safety mode: careful support for risky topics.
- Motion specialist: only when the student asks about Motion concepts.

## Required Environment

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
OPENAI_API_KEY=your-openai-api-key
DEEPGRAM_API_KEY=your-deepgram-api-key
SARVAM_API_KEY=your-sarvam-api-key
SARVAM_TARGET_LANGUAGE=en-IN
SARVAM_TTS_MODEL=bulbul:v3
SARVAM_TTS_SPEAKER=shubh
```

## Local Run

Terminal 1:

```powershell
npm.cmd run dev
```

Terminal 2:

```powershell
cd agents/livekit
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python vidya_agent.py dev
```

Then open `http://localhost:3000` and start a live session.

## Why This Is More Realistic

The older flow was request/response:

- record audio
- upload audio
- wait for transcription
- call chat
- generate TTS
- play audio

LiveKit replaces that with a realtime media room:

- browser publishes microphone audio over WebRTC
- Python agent joins as a participant
- agent performs Deepgram transcription, OpenAI reasoning, Sarvam speech with the `shubh` Indian voice, Silero VAD, and turn detection
- browser receives audio as a live remote track

This is the correct foundation for a believable talking tutor.
