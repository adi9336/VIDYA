import asyncio
import logging
import os

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    ChatContext,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    cli,
    llm,
    metrics,
    room_io,
)
from livekit.plugins import openai, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from vidya.prompts import base_agent_prompt, greeting_instructions
from vidya.supervisor import VidyaSupervisor

try:
    from livekit.plugins import sarvam
except ImportError:
    sarvam = None

# Uncomment after adding the noise-cancellation extra/plugin.
# from livekit.plugins import noise_cancellation

logger = logging.getLogger("vidya-livekit-agent")

load_dotenv()

class VidyaAgent(Agent):
    def __init__(self, *, supervisor: VidyaSupervisor) -> None:
        self.supervisor = supervisor
        super().__init__(
            instructions=base_agent_prompt(),
        )

    async def on_enter(self):
        self.session.generate_reply(instructions=greeting_instructions())

    async def on_user_turn_completed(self, turn_ctx: ChatContext, new_message: llm.ChatMessage):
        latest_user_text = getattr(new_message, "text_content", "") or ""
        _plan, _trace, instructions = await self.supervisor.plan_turn(latest_user_text)
        turn_ctx.add_message(role="system", content=instructions)


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
        # LLM: final voice response. Routing is handled by VidyaSupervisor first.
        llm=f"openai/{os.getenv('VIDYA_REPLY_MODEL', 'gpt-5.2')}",
        # TTS: Sarvam Indian voice when configured, otherwise OpenAI male fallback.
        tts=build_tts(),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=False,
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
    supervisor = VidyaSupervisor(room=ctx.room)

    async def process_chat(reader: rtc.TextStreamReader, participant_identity: str):
        text = (await reader.read_all()).strip()
        if not text:
            return

        logger.info("Received typed message from %s: %s", participant_identity, text)
        _plan, _trace, instructions = await supervisor.plan_turn(text)
        session.interrupt()
        session.generate_reply(
            user_input=text,
            instructions=instructions,
        )

    def handle_chat(reader: rtc.TextStreamReader, participant_identity: str):
        asyncio.create_task(process_chat(reader, participant_identity))

    ctx.room.register_text_stream_handler("vidya.text", handle_chat)

    await session.start(
        agent=VidyaAgent(supervisor=supervisor),
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
