from __future__ import annotations

import logging

from livekit import rtc

from .events import emit_agent_state, emit_visual_request
from .prompts import reply_instructions
from .router import TurnRouter
from .schemas import AgentTrace, TurnPlan

logger = logging.getLogger("vidya-supervisor")


class VidyaSupervisor:
    def __init__(self, *, room: rtc.Room, router: TurnRouter | None = None) -> None:
        self.room = room
        self.router = router or TurnRouter()
        self._recent_user_messages: list[str] = []

    async def plan_turn(self, latest_user_text: str) -> tuple[TurnPlan, AgentTrace, str]:
        text = latest_user_text.strip()
        if text:
            self._recent_user_messages.append(text)
            self._recent_user_messages = self._recent_user_messages[-8:]

        plan = await self.router.route(self._recent_user_messages)
        trace = AgentTrace.from_plan(room_name=self.room.name, plan=plan)

        logger.info(
            "turn planned",
            extra={
                "trace_id": trace.trace_id,
                "mode": plan.mode.value,
                "confidence": plan.confidence,
                "source": plan.source,
                "room": self.room.name,
            },
        )

        await emit_agent_state(self.room, plan=plan, trace=trace)
        await emit_visual_request(self.room, plan=plan, trace=trace)

        return plan, trace, reply_instructions(plan)
