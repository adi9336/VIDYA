# Vidya LiveKit Agent

This folder contains the backend worker for realtime voice mode.

It is based on the LiveKit Agents `examples/voice_agents/basic_agent.py` pattern from:

`C:\Users\ADITYA GUPTA\agents-assignment\examples\voice_agents\basic_agent.py`

## Setup

Create a Python environment and install dependencies:

```powershell
cd agents/livekit
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Set environment variables in the project root `.env` or this folder's `.env`:

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
SARVAM_TTS_PACE=0.92
SARVAM_TTS_TEMPERATURE=0.55
```

Run the worker:

```powershell
python vidya_agent.py dev
```

Then open the Next.js app and click `Start live session`.

## Notes

- The Next.js frontend only joins a LiveKit room.
- The Python worker joins the same room as the agent participant and handles realtime listening, thinking, and speaking.
- The current worker uses Deepgram STT, OpenAI LLM, Sarvam TTS speaker `shubh` for an Indian companion voice, Silero VAD, and multilingual turn detection.
- If `SARVAM_API_KEY` is missing, the worker falls back to OpenAI TTS voice `onyx`.
- LangChain is installed for the next RAG/tooling step, but the worker intentionally keeps the first voice path simple.
- If you want manual push-to-talk RPC later, use `examples/voice_agents/push_to_talk.py` from the linked repo as the next reference.
