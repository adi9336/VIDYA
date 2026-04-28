export type ConceptId =
  | "distance-displacement"
  | "speed-velocity"
  | "acceleration";

export type Role = "system" | "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

export type UnderstandingSignal = "understood" | "still-confused" | "curious";

export interface Session {
  sessionId: string;
  conceptId: ConceptId;
  messages: Message[];
  understandingSignal?: UnderstandingSignal;
}

export interface TutorVisual {
  kind: "generated" | "static" | "none";
  status: "ready" | "skipped" | "error";
  url?: string;
  promptHash?: string;
  title?: string;
  altText: string;
  errorMessage?: string;
}

export interface TutorTurn {
  assistantText: string;
  spokenText: string;
  followUpQuestion: string;
  understandingCheck: string;
  visualId: string;
  visual: TutorVisual;
  citations: string[];
  fallbackMode: "normal" | "slow-down" | "direct";
}
