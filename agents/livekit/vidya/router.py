from __future__ import annotations

import asyncio
import json
import os
import re
from typing import Any

from openai import AsyncOpenAI

from .schemas import SafetyDirective, SafetyLevel, TurnMode, TurnPlan, VisualDirective

MOTION_RE = re.compile(
    r"\b(motion|distance|displacement|speed|velocity|acceleration|accelerate|deceleration|uniform|non-uniform|graph|direction|speedometer)\b",
    re.IGNORECASE,
)
DIRECT_RE = re.compile(r"\b(definition|direct|seedha|sidha|bas bata|formula)\b", re.IGNORECASE)
STUDY_COACH_RE = re.compile(
    r"\b(timetable|schedule|focus|procrastinat|revision|revise|exam stress|padhai plan|study plan|routine)\b",
    re.IGNORECASE,
)
SAFETY_RE = re.compile(
    r"\b(suicide|self harm|kill myself|mar ja|harm myself|abuse|violence|drug overdose)\b",
    re.IGNORECASE,
)


ROUTER_SYSTEM_PROMPT = """
You are Kittu's routing supervisor. Return only valid JSON.

Classify the student's latest turn into exactly one mode:
buddy, tutor, study_coach, clarifier, safety, motion_specialist.

Use motion_specialist only for Motion concepts: distance, displacement, speed, velocity,
acceleration, uniform/non-uniform motion, direction, or motion graphs.
Use buddy for casual conversation.
Use tutor for non-Motion learning, solving, revising, explaining, comparing, or answer checking.
Use study_coach for focus, timetable, exam stress, routine, or procrastination.
Use clarifier for vague requests that cannot be answered safely.
Use safety for self-harm, harm, abuse, or urgent risk.

JSON shape:
{
  "mode": "buddy",
  "confidence": 0.0,
  "student_intent": "short intent",
  "reply_style": "short voice style instruction",
  "needs_visual": false,
  "visual_concept": null,
  "safety_level": "none",
  "safety_reason": ""
}
""".strip()


def _latest_text(messages: list[str]) -> str:
    return messages[-1].strip() if messages else ""


def deterministic_fallback(messages: list[str], *, reason: str = "router fallback") -> TurnPlan:
    latest = _latest_text(messages)
    lowered = latest.lower()

    if SAFETY_RE.search(latest):
        return TurnPlan(
            mode=TurnMode.SAFETY,
            confidence=0.72,
            student_intent="possible safety or crisis support",
            reply_style="calm, careful, supportive, short",
            safety=SafetyDirective(SafetyLevel.URGENT, reason),
            source="fallback",
        ).normalized()

    if MOTION_RE.search(latest):
        concept = "speed-velocity"
        if re.search(r"\b(distance|displacement|path|position)\b", latest, re.IGNORECASE):
            concept = "distance-displacement"
        elif re.search(r"\b(acceleration|accelerate|deceleration)\b", latest, re.IGNORECASE):
            concept = "acceleration"

        return TurnPlan(
            mode=TurnMode.MOTION_SPECIALIST,
            confidence=0.78,
            student_intent="understand a Motion concept",
            reply_style="friendly Hinglish senior, analogy-first unless direct answer requested",
            visual=VisualDirective(True, concept, "Motion concept can benefit from a diagram."),
            source="fallback",
        ).normalized()

    if STUDY_COACH_RE.search(latest):
        return TurnPlan(
            mode=TurnMode.STUDY_COACH,
            confidence=0.74,
            student_intent="study coaching or planning",
            reply_style="practical, motivating, concise Hinglish",
            source="fallback",
        ).normalized()

    if len(lowered.split()) <= 2 or lowered in {"help", "samjhao", "batao", "kya"}:
        return TurnPlan(
            mode=TurnMode.CLARIFIER,
            confidence=0.62,
            student_intent="unclear request",
            reply_style="ask one short clarifying question",
            source="fallback",
        ).normalized()

    return TurnPlan(
        mode=TurnMode.BUDDY,
        confidence=0.6,
        student_intent="casual conversation or general support",
        reply_style="cool, warm, useful Hinglish buddy",
        source="fallback",
    ).normalized()


def _coerce_plan(data: dict[str, Any]) -> TurnPlan:
    mode = TurnMode(str(data.get("mode", TurnMode.BUDDY.value)))
    safety_level = SafetyLevel(str(data.get("safety_level", SafetyLevel.NONE.value)))
    visual_concept = data.get("visual_concept")
    if visual_concept not in {"distance-displacement", "speed-velocity", "acceleration"}:
        visual_concept = None

    return TurnPlan(
        mode=mode,
        confidence=float(data.get("confidence", 0.5)),
        student_intent=str(data.get("student_intent", "student turn")),
        reply_style=str(data.get("reply_style", "natural Hinglish")),
        visual=VisualDirective(
            needs_visual=bool(data.get("needs_visual", False)),
            concept=visual_concept,
            reason=str(data.get("visual_reason", "")),
        ),
        safety=SafetyDirective(
            level=safety_level,
            reason=str(data.get("safety_reason", "")),
        ),
        source="llm",
    ).normalized()


class TurnRouter:
    def __init__(self, *, model: str | None = None, timeout_ms: int | None = None) -> None:
        self.model = model or os.getenv("VIDYA_ROUTER_MODEL", "gpt-5-mini")
        self.timeout_ms = timeout_ms or int(os.getenv("VIDYA_ROUTER_TIMEOUT_MS", "2500"))
        self._client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None

    async def route(self, messages: list[str]) -> TurnPlan:
        if self._client is None:
            return deterministic_fallback(messages, reason="missing OPENAI_API_KEY")

        try:
            return await asyncio.wait_for(self._route_with_llm(messages), timeout=self.timeout_ms / 1000)
        except Exception as exc:
            return deterministic_fallback(messages, reason=f"router failed: {exc}")

    async def _route_with_llm(self, messages: list[str]) -> TurnPlan:
        response = await self._client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": ROUTER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": "Recent student messages:\n"
                    + "\n".join(f"- {message}" for message in messages[-6:])
                    + f"\n\nLatest turn: {_latest_text(messages)}",
                },
            ],
            text={"format": {"type": "json_object"}},
        )
        raw = response.output_text.strip()
        return _coerce_plan(json.loads(raw))
