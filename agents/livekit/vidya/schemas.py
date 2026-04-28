from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from time import time
from typing import Any, Literal
from uuid import uuid4


class TurnMode(str, Enum):
    BUDDY = "buddy"
    TUTOR = "tutor"
    STUDY_COACH = "study_coach"
    CLARIFIER = "clarifier"
    SAFETY = "safety"
    MOTION_SPECIALIST = "motion_specialist"


class SafetyLevel(str, Enum):
    NONE = "none"
    CAUTION = "caution"
    URGENT = "urgent"


MotionConcept = Literal["distance-displacement", "speed-velocity", "acceleration"]


@dataclass(frozen=True)
class VisualDirective:
    needs_visual: bool = False
    concept: MotionConcept | None = None
    reason: str = ""


@dataclass(frozen=True)
class SafetyDirective:
    level: SafetyLevel = SafetyLevel.NONE
    reason: str = ""


@dataclass(frozen=True)
class TurnPlan:
    mode: TurnMode
    confidence: float
    student_intent: str
    reply_style: str
    visual: VisualDirective = field(default_factory=VisualDirective)
    safety: SafetyDirective = field(default_factory=SafetyDirective)
    source: Literal["llm", "fallback"] = "llm"

    def normalized(self) -> "TurnPlan":
        confidence = min(1.0, max(0.0, self.confidence))
        visual = self.visual
        safety = self.safety

        if self.mode != TurnMode.MOTION_SPECIALIST:
            visual = VisualDirective(False, None, "")

        if self.mode == TurnMode.SAFETY:
            visual = VisualDirective(False, None, "")
            if safety.level == SafetyLevel.NONE:
                safety = SafetyDirective(SafetyLevel.CAUTION, "Safety mode selected.")

        return TurnPlan(
            mode=self.mode,
            confidence=confidence,
            student_intent=self.student_intent[:180],
            reply_style=self.reply_style[:240],
            visual=visual,
            safety=safety,
            source=self.source,
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class AgentTrace:
    trace_id: str
    room_name: str
    mode: TurnMode
    confidence: float
    source: str
    created_at: float

    @classmethod
    def from_plan(cls, *, room_name: str, plan: TurnPlan) -> "AgentTrace":
        return cls(
            trace_id=f"tr_{uuid4().hex[:12]}",
            room_name=room_name,
            mode=plan.mode,
            confidence=plan.confidence,
            source=plan.source,
            created_at=time(),
        )
