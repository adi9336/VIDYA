import asyncio
import logging
import os

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    cli,
    metrics,
    room_io,
)
from livekit.plugins import openai, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

try:
    from livekit.plugins import sarvam
except ImportError:
    sarvam = None

# Uncomment after adding the noise-cancellation extra/plugin.
# from livekit.plugins import noise_cancellation

logger = logging.getLogger("vidya-livekit-agent")

load_dotenv()

VIDYA_SYSTEM_PROMPT = """
You are Vidya AI, a cool, warm, helpful buddy for a student.
You sound like a smart senior friend, not a teacher, textbook, or corporate chatbot.

Default language is natural Hinglish unless the student clearly uses another language.
Keep replies short for voice: usually 1 to 3 sentences.
Do not use markdown, emojis, asterisks, bullet lists, or special formatting.
Never start two replies the same way. Avoid filler openers like Great question, Sure, or Of course.

Adaptive system:
- Buddy mode is default. Use it for greetings, casual talk, motivation, small advice, planning, jokes, and normal conversation.
- Tutor mode activates only when the student asks to learn, understand, solve, revise, explain, compare, or check an answer.
- Study coach mode activates for focus, timetable, exam stress, procrastination, or revision strategy.
- Clarifier mode activates when the request is vague. Ask one short clarifying question.
- Safety mode activates for harmful, medical, legal, financial, or crisis topics. Be careful and suggest a trusted adult or professional when needed.

Buddy mode rules:
- Do not force any subject.
- Do not jump to Physics or Motion.
- Reply like a real companion who is present and useful.
- If the student is just chatting, chat back normally.

Tutor mode rules:
- First understand what they are asking.
- For concepts, start from a small real-life example, then explain.
- If they say direct, seedha, definition, formula, or bas bata, answer directly first.
- Ask at most one question only when needed to continue.
- If unsure, say: Yeh mujhe confirm karna padega.
- If the student is confused, go smaller and more physical instead of repeating.
- If the student sounds frustrated, say: Yeh confusing lagta hai, seedha baat karte hain.

Motion specialist:
- Use NCERT Class 9 Motion style only when the student asks about motion, speed, velocity, acceleration, distance, displacement, uniform motion, non-uniform motion, or motion graphs.
- Do not mention Motion unless it is relevant to the student's request.
""".strip()


class VidyaAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=VIDYA_SYSTEM_PROMPT,
        )

    async def on_enter(self):
        self.session.generate_reply(
            instructions=(
                "Greet the student in one short friendly Hinglish sentence. "
                "Sound like a buddy who is ready to talk or help with studies. "
                "Do not mention Motion or start teaching."
            )
        )


def build_tts():
    if os.getenv("SARVAM_API_KEY") and sarvam is not None:
        return sarvam.TTS(
            target_language_code=os.getenv("SARVAM_TARGET_LANGUAGE", "en-IN"),
            model=os.getenv("SARVAM_TTS_MODEL", "bulbul:v3"),
            speaker=os.getenv("SARVAM_TTS_SPEAKER", "shubh"),
            pace=float(os.getenv("SARVAM_TTS_PACE", "0.92")),
            temperature=float(os.getenv("SARVAM_TTS_TEMPERATURE", "0.55")),
            output_audio_bitrate="128k",
            min_buffer_size=50,
            max_chunk_length=150,
        )

    if os.getenv("SARVAM_API_KEY") and sarvam is None:
        logger.warning("SARVAM_API_KEY is set, but the LiveKit Sarvam plugin is not installed. Falling back to OpenAI TTS.")

    return openai.TTS(
        model="gpt-4o-mini-tts",
        voice="onyx",
        instructions="Speak in a warm, calm male voice that sounds like a helpful Indian older brother.",
    )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    session = AgentSession(
        # STT: user's speech to text.
        stt="deepgram/nova-3",
        # LLM: tutoring brain.
        llm="openai/gpt-4.1-mini",
        # TTS: Sarvam Indian voice when configured, otherwise OpenAI male fallback.
        tts=build_tts(),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
        resume_false_interruption=True,
        false_interruption_timeout=1.0,
    )

    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info("Usage: %s", summary)

    ctx.add_shutdown_callback(log_usage)

    async def process_chat(reader: rtc.TextStreamReader, participant_identity: str):
        text = (await reader.read_all()).strip()
        if not text:
            return

        logger.info("Received typed message from %s: %s", participant_identity, text)
        session.interrupt()
        session.generate_reply(
            user_input=text,
            instructions=(
                "The student typed this instead of speaking. "
                "Route it using the adaptive system: buddy by default, tutor only when asked. "
                "Reply naturally in Hinglish and speak the answer."
            ),
        )

    def handle_chat(reader: rtc.TextStreamReader, participant_identity: str):
        asyncio.create_task(process_chat(reader, participant_identity))

    ctx.room.register_text_stream_handler("vidya.text", handle_chat)

    await session.start(
        agent=VidyaAgent(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                # noise_cancellation=noise_cancellation.BVC(),
            ),
            close_on_disconnect=False,
        ),
    )


if __name__ == "__main__":
    cli.run_app(server)
