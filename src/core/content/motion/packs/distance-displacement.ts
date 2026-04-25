import type { MotionConceptPack } from "../types";

export const distanceDisplacementPack: MotionConceptPack = {
  id: "distance-displacement",
  title: "Distance vs Displacement",
  chapter: "Motion",
  difficulty: "foundation",
  learnerLevel: "Class 9 Physics",
  everydayHook:
    "Imagine leaving home, walking around your colony, and ending up back at the same gate.",
  definition:
    "Distance is the total path length covered. Displacement is the shortest straight-line change from start to finish, with direction.",
  whyItMatters:
    "Students often think movement always means a non-zero final change in position. This concept separates path from actual position change.",
  analogy: {
    title: "Evening Walk Around the Park",
    setup:
      "A student starts at the park gate, completes one full round, and stops exactly where they started.",
    payoff:
      "The student definitely moved, so distance exists. But the start and end positions match, so displacement is zero.",
  },
  tutorPrompts: [
    {
      prompt:
        "Agar tum colony ka full round maar ke wahi gate par aa jao, kya tumne move kiya ya nahi?",
      intent: "hook",
    },
    {
      prompt:
        "Total kitna ghoome aur start se finish tak seedhi line mein kitna shift hue, dono same honge kya?",
      intent: "probe",
    },
    {
      prompt:
        "Path aur final position ko alag socho. Motion hua, lekin final location change hua ya nahi?",
      intent: "correct",
    },
    {
      prompt:
        "Ek line mein bolo: distance kya batata hai aur displacement kya batata hai?",
      intent: "recap",
    },
  ],
  checkpoints: [
    {
      question:
        "A runner completes one lap of a circular track and stops at the start. What can you say about distance and displacement?",
      expectedSignal: "Distance is non-zero and displacement is zero.",
      hint: "Total path and start-to-end shift are different ideas.",
    },
    {
      question:
        "If a student walks 3 m east and then 4 m west, which quantity depends on direction?",
      expectedSignal: "Displacement depends on direction.",
      hint: "Ask which quantity cares about where you finally end up.",
    },
  ],
  misconceptions: [
    {
      belief: "If something moves, displacement must also be there.",
      correctionAngle: "Movement can happen without net position change.",
    },
    {
      belief: "Distance and displacement are just two names for the same thing.",
      correctionAngle: "One tracks path length, the other tracks overall change in position.",
    },
  ],
  recapBullets: [
    "Distance never decreases because it adds path covered.",
    "Displacement compares only the starting and ending positions.",
    "Round trips can have distance but zero displacement.",
  ],
  visualCues: [
    {
      stage: "hook",
      sceneId: "distance-displacement-loop",
      teachingGoal: "Show a full journey around a loop.",
    },
    {
      stage: "compare",
      sceneId: "distance-displacement-chord",
      teachingGoal: "Contrast curved path with straight start-to-end line.",
    },
    {
      stage: "recap",
      sceneId: "distance-displacement-summary",
      teachingGoal: "Reinforce path length versus net change.",
    },
  ],
  keywords: [
    "motion",
    "path length",
    "net change",
    "straight line",
    "direction",
  ],
};
