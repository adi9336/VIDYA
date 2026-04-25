import type { MotionConceptPack } from "../types";

export const speedVelocityPack: MotionConceptPack = {
  id: "speed-velocity",
  title: "Speed vs Velocity",
  chapter: "Motion",
  difficulty: "foundation",
  learnerLevel: "Class 9 Physics",
  everydayHook:
    "Two bikes show the same speedometer reading, but one is heading toward school and the other is riding back home.",
  definition:
    "Speed is how fast something moves. Velocity is speed with direction.",
  whyItMatters:
    "Students see the numerical value and miss that direction changes the physical meaning of motion.",
  analogy: {
    title: "Two Bikes, Opposite Directions",
    setup:
      "Two friends ride at 20 km/h. One rides east toward tuition, the other west toward the market.",
    payoff:
      "Their speed matches because both are equally fast. Their velocity differs because the directions are different.",
  },
  tutorPrompts: [
    {
      prompt:
        "Agar do log equally fast chal rahe ho but opposite directions mein, kya dono ka motion exactly same hoga?",
      intent: "hook",
    },
    {
      prompt:
        "Speedometer tumhe kya batata hai: bas kitni fast movement ho rahi hai ya kidhar bhi?",
      intent: "probe",
    },
    {
      prompt:
        "Direction jodte hi quantity ka meaning badal jata hai. Ab kaunsi quantity ban rahi hai?",
      intent: "correct",
    },
    {
      prompt:
        "Speed aur velocity mein ek sharp difference khud se frame karo.",
      intent: "recap",
    },
  ],
  checkpoints: [
    {
      question:
        "A car moves north at 40 km/h. Which part of this statement refers to speed, and which part makes it velocity?",
      expectedSignal: "40 km/h is speed; north makes it velocity.",
      hint: "Separate number from direction.",
    },
    {
      question:
        "Can two objects have the same speed but different velocity?",
      expectedSignal: "Yes, when their directions differ.",
      hint: "Think of two racers moving equally fast on opposite sides.",
    },
  ],
  misconceptions: [
    {
      belief: "Velocity is always greater than speed because it sounds more advanced.",
      correctionAngle: "Velocity is not a bigger version of speed; it is speed plus direction.",
    },
    {
      belief: "If the speed value is the same, the motion is identical.",
      correctionAngle: "Without direction, the description is incomplete.",
    },
  ],
  recapBullets: [
    "Speed is scalar, so it tells only how fast.",
    "Velocity is directional, so it tells how fast and toward where.",
    "Opposite directions can keep speed same while changing velocity.",
  ],
  visualCues: [
    {
      stage: "hook",
      sceneId: "speed-velocity-bikes",
      teachingGoal: "Show equal speed with opposite travel directions.",
    },
    {
      stage: "explain",
      sceneId: "speed-velocity-arrows",
      teachingGoal: "Use arrows to attach direction to the same magnitude.",
    },
    {
      stage: "checkpoint",
      sceneId: "speed-velocity-signpost",
      teachingGoal: "Prompt the learner to read number plus direction together.",
    },
  ],
  keywords: [
    "speed",
    "velocity",
    "direction",
    "scalar",
    "vector",
  ],
};
