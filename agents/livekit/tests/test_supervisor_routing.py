import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from vidya.router import deterministic_fallback
from vidya.schemas import SafetyLevel, TurnMode


class SupervisorRoutingTests(unittest.TestCase):
    def test_motion_turn_routes_to_motion_specialist_with_visual(self):
        plan = deterministic_fallback(["velocity aur speed ka difference samjhao"])

        self.assertEqual(plan.mode, TurnMode.MOTION_SPECIALIST)
        self.assertTrue(plan.visual.needs_visual)
        self.assertEqual(plan.visual.concept, "speed-velocity")

    def test_casual_turn_routes_to_buddy_without_visual(self):
        plan = deterministic_fallback(["aaj mood off hai yaar"])

        self.assertEqual(plan.mode, TurnMode.BUDDY)
        self.assertFalse(plan.visual.needs_visual)
        self.assertIsNone(plan.visual.concept)

    def test_study_planning_routes_to_study_coach(self):
        plan = deterministic_fallback(["kal exam hai timetable bana do"])

        self.assertEqual(plan.mode, TurnMode.STUDY_COACH)
        self.assertFalse(plan.visual.needs_visual)

    def test_vague_turn_routes_to_clarifier(self):
        plan = deterministic_fallback(["samjhao"])

        self.assertEqual(plan.mode, TurnMode.CLARIFIER)

    def test_safety_turn_suppresses_visuals(self):
        plan = deterministic_fallback(["I want to harm myself"])

        self.assertEqual(plan.mode, TurnMode.SAFETY)
        self.assertEqual(plan.safety.level, SafetyLevel.URGENT)
        self.assertFalse(plan.visual.needs_visual)


if __name__ == "__main__":
    unittest.main()
