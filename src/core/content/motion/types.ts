export type MotionConceptId =
  | "distance-displacement"
  | "speed-velocity"
  | "acceleration";

export type MotionDifficulty = "foundation" | "exam-ready";

export type MotionVisualStage =
  | "hook"
  | "compare"
  | "explain"
  | "checkpoint"
  | "recap";

export type MotionPrompt = {
  prompt: string;
  intent: "hook" | "probe" | "correct" | "recap";
};

export type MotionCheckpoint = {
  question: string;
  expectedSignal: string;
  hint: string;
};

export type MotionMisconception = {
  belief: string;
  correctionAngle: string;
};

export type MotionVisualCue = {
  stage: MotionVisualStage;
  sceneId: string;
  teachingGoal: string;
};

export type MotionConceptPack = {
  id: MotionConceptId;
  title: string;
  chapter: "Motion";
  difficulty: MotionDifficulty;
  learnerLevel: string;
  everydayHook: string;
  definition: string;
  whyItMatters: string;
  analogy: {
    title: string;
    setup: string;
    payoff: string;
  };
  tutorPrompts: MotionPrompt[];
  checkpoints: MotionCheckpoint[];
  misconceptions: MotionMisconception[];
  recapBullets: string[];
  visualCues: MotionVisualCue[];
  keywords: string[];
};
