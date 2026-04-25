import type { ConceptId, Message, TutorTurn, UnderstandingSignal } from "@/types/session";

export interface ChatRequest {
  sessionId: string;
  conceptId: ConceptId;
  messages: Message[];
  inputMode: "text" | "voice";
  understandingSignal?: UnderstandingSignal;
}

export interface ChatResponse {
  conceptId: ConceptId;
  tutorTurn: TutorTurn;
}

export interface SpeechToTextResponse {
  transcript: string;
  languageGuess: string;
  confidence: number;
}

export interface TextToSpeechResponse {
  audioUrl: string;
  durationMs: number;
}

export interface VisualHint {
  visualId: string;
  title: string;
  altText: string;
  animationHint?: string;
}
