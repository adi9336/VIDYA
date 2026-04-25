import type { MotionConceptPack } from "../types";

export const accelerationPack: MotionConceptPack = {
  id: "acceleration",
  title: "Acceleration",
  chapter: "Motion",
  difficulty: "exam-ready",
  learnerLevel: "Class 9 Physics",
  everydayHook:
    "A bus leaves a stop slowly, picks up pace, and then brakes hard before the next turn.",
  definition:
    "Acceleration is the rate at which velocity changes with time.",
  whyItMatters:
    "Students often reduce acceleration to only speeding up, missing that slowing down or changing direction also count when velocity changes.",
  analogy: {
    title: "Bus Ride Push and Pull",
    setup:
      "When the bus starts, your body feels pushed backward. When it brakes, you lean forward.",
    payoff:
      "Those body sensations are evidence that velocity is changing. That change per unit time is acceleration.",
  },
  tutorPrompts: [
    {
      prompt:
        "Bus start hote hi body peeche kyu feel hoti hai, aur brake par aage kyu jhatka lagta hai?",
      intent: "hook",
    },
    {
      prompt:
        "Sirf speed badalne par hi motion ka feel change hota hai, ya direction aur slowing down bhi matter karte hain?",
      intent: "probe",
    },
    {
      prompt:
        "Acceleration ko sirf tez hone se mat jodo. Jab velocity change hoti hai tab acceleration hota hai.",
      intent: "correct",
    },
    {
      prompt:
        "Acceleration ka simplest meaning bolo without using the formula first.",
      intent: "recap",
    },
  ],
  checkpoints: [
    {
      question:
        "A scooter slows from 30 km/h to 10 km/h in 5 seconds. Is acceleration present?",
      expectedSignal: "Yes, because velocity changes while slowing down.",
      hint: "Negative acceleration is still acceleration.",
    },
    {
      question:
        "An object moves at constant speed in a circle. Can acceleration be present?",
      expectedSignal: "Yes, because direction changes.",
      hint: "Velocity depends on direction, not just speed.",
    },
  ],
  misconceptions: [
    {
      belief: "Acceleration means only speeding up.",
      correctionAngle: "Any change in velocity counts, including slowing down.",
    },
    {
      belief: "If speed stays constant, acceleration must be zero.",
      correctionAngle: "Direction change can still create acceleration.",
    },
  ],
  recapBullets: [
    "Acceleration tracks change in velocity over time.",
    "Speeding up and slowing down both involve acceleration.",
    "Direction change can create acceleration even at constant speed.",
  ],
  visualCues: [
    {
      stage: "hook",
      sceneId: "acceleration-bus-start-stop",
      teachingGoal: "Show the bus speeding up and braking.",
    },
    {
      stage: "explain",
      sceneId: "acceleration-speed-graph",
      teachingGoal: "Connect change in velocity with elapsed time.",
    },
    {
      stage: "recap",
      sceneId: "acceleration-turning-arrow",
      teachingGoal: "Reinforce that direction change also counts.",
    },
  ],
  keywords: [
    "acceleration",
    "deceleration",
    "velocity change",
    "time",
    "direction change",
  ],
};
