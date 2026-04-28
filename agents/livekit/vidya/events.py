from __future__ import annotations

import json
import logging
import os
from dataclasses import asdict
from typing import Any

from livekit import rtc

from .schemas import AgentTrace, TurnPlan

logger = logging.getLogger("vidya-events")

TOPIC_AGENT_STATE = "vidya.agent_state"
TOPIC_VISUAL_REQUEST = "vidya.visual_request"


async def _stream_json(room: rtc.Room, *, topic: str, payload: dict[str, Any]) -> None:
    writer = await room.local_participant.stream_text(
        topic=topic,
        attributes={"content-type": "application/json"},
    )
    await writer.write(json.dumps(payload, ensure_ascii=True))
    await writer.aclose()


async def emit_agent_state(room: rtc.Room, *, plan: TurnPlan, trace: AgentTrace) -> None:
    try:
        await _stream_json(
            room,
            topic=TOPIC_AGENT_STATE,
            payload={
                "traceId": trace.trace_id,
                "mode": plan.mode.value,
                "confidence": plan.confidence,
                "source": plan.source,
                "studentIntent": plan.student_intent,
            },
        )
    except Exception:
        logger.exception("failed to emit agent state event")


async def emit_visual_request(room: rtc.Room, *, plan: TurnPlan, trace: AgentTrace) -> None:
    if os.getenv("VIDYA_ENABLE_VISUAL_EVENTS", "true").lower() != "true":
        return

    if not plan.visual.needs_visual or not plan.visual.concept:
        return

    try:
        await _stream_json(
            room,
            topic=TOPIC_VISUAL_REQUEST,
            payload={
                "traceId": trace.trace_id,
                "conceptId": plan.visual.concept,
                "reason": plan.visual.reason,
                "plan": asdict(plan),
            },
        )
    except Exception:
        logger.exception("failed to emit visual request event")
