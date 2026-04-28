import { motionConcepts } from "@/core/concepts/motion";
import { getMotionConceptPack } from "@/core/content/motion";
import { systemPrompt } from "@/core/prompts/system";
import { getVisualHintForConcept } from "@/features/visuals";
import { generateMotionVisual, skippedVisual } from "@/features/visuals/server/generated-visuals";
import { generateTutorCopy } from "@/lib/providers/model";
import type { ChatRequest, ChatResponse } from "@/types/api";
import type { ConceptId, TutorTurn } from "@/types/session";

function buildFallbackMode(request: ChatRequest): TutorTurn["fallbackMode"] {
  if (request.understandingSignal === "still-confused") {
    return "slow-down";
  }

  const latestUserMessage = [...request.messages].reverse().find((message) => message.role === "user")?.content ?? "";
  if (/definition|direct|seedha|bas bata|sidha/i.test(latestUserMessage)) {
    return "direct";
  }

  return "normal";
}

function buildFollowUpQuestion(conceptId: ConceptId, fallbackMode: TutorTurn["fallbackMode"]): string {
  const lessonPack = getMotionConceptPack(conceptId);
  if (fallbackMode === "slow-down") {
    return lessonPack.tutorPrompts.find((prompt) => prompt.intent === "correct")?.prompt ?? lessonPack.tutorPrompts[0].prompt;
  }

  if (fallbackMode === "direct") {
    return lessonPack.checkpoints[0]?.question ?? lessonPack.tutorPrompts[0].prompt;
  }

  return lessonPack.tutorPrompts.find((prompt) => prompt.intent === "probe")?.prompt ?? lessonPack.tutorPrompts[0].prompt;
}

const motionTermPattern =
  /\b(motion|distance|displacement|speed|velocity|velosity|vlosity|acceleration|accelerate|deceleration|uniform|non-uniform|graph|direction|speedometer)\b/i;

const motionFollowUpPattern =
  /\b(dono|same|alag|different|opposite|side|taraf|kidhar|kahan|fast|slow|tez|direction|equal|change|turn)\b/i;

function isMotionRequest(message: string): boolean {
  return motionTermPattern.test(
    message
  );
}

function isMotionFollowUp(request: ChatRequest, latestUserMessage: string): boolean {
  if (!motionFollowUpPattern.test(latestUserMessage)) {
    return false;
  }

  const previousMessages = request.messages.slice(0, -1).slice(-4);
  return previousMessages.some((message) => isMotionRequest(message.content));
}

function shouldUseMotionSpecialist(request: ChatRequest, latestUserMessage: string): boolean {
  return isMotionRequest(latestUserMessage) || isMotionFollowUp(request, latestUserMessage);
}

function buildGeneralFollowUp(fallbackMode: TutorTurn["fallbackMode"]): string {
  if (fallbackMode === "slow-down") {
    return "Kaunsa part confusing laga: word ka meaning, formula, ya example?";
  }

  if (fallbackMode === "direct") {
    return "Ab isko ek chhote example se connect karein?";
  }

  return "Is topic ka kaunsa part samajhna hai: meaning, example, ya question solving?";
}

function buildCoachingGoal(conceptId: ConceptId, latestUserMessage: string, fallbackMode: TutorTurn["fallbackMode"]): string {
  const question = latestUserMessage.toLowerCase();

  if (fallbackMode === "slow-down") {
    return "The student is confused. Acknowledge it briefly, go smaller and more physical, and use one familiar real-life situation. Do not repeat the same explanation.";
  }

  if (fallbackMode === "direct") {
    return "The student explicitly wants a direct answer. Give the NCERT-aligned definition first in simple Hinglish, then add one anchor analogy.";
  }

  if (conceptId === "distance-displacement" && /jyada|greater|bada|bigger/.test(question)) {
    return "Do not start with the rule. First use a familiar walking or round-trip situation, then help the student notice that total path can be greater than or equal to straight-line change.";
  }

  if (conceptId === "speed-velocity" && /difference|farq|same/.test(question)) {
    return "Do not start with a definition. First use two people moving equally fast in different directions, then connect their answer to direction being the key distinction.";
  }

  if (conceptId === "acceleration" && /direction|turn|ghoom/.test(question)) {
    return "Do not start with the formula. First use turning on a cycle or bike, then connect it to velocity changing when direction changes.";
  }

  return "Be a good communicator first. Do not lecture or open with the selected concept. Start with one tiny lived-experience prompt or situation, then connect only as much Physics as the student asked for.";
}

export async function generateTutorTurn(request: ChatRequest): Promise<ChatResponse> {
  const concept = motionConcepts.find((item) => item.id === request.conceptId);

  if (!concept) {
    throw new Error(`Unknown concept: ${request.conceptId}`);
  }

  const lessonPack = getMotionConceptPack(request.conceptId);
  const fallbackMode = buildFallbackMode(request);
  const latestUserMessage = [...request.messages].reverse().find((message) => message.role === "user")?.content ?? "";

  if (!shouldUseMotionSpecialist(request, latestUserMessage)) {
    const assistantText = await generateTutorCopy({
      systemPrompt,
      messages: request.messages,
      lessonSummary:
        "GENERAL_TUTORING_CONTEXT: The student may ask about any school topic. Do not force Physics or Motion. Explain like a friendly senior study buddy in simple Hinglish.",
      latestUserMessage,
      coachingGoal:
        fallbackMode === "slow-down"
          ? "The student is confused. Slow down, use a smaller everyday example, and avoid making them feel judged."
          : fallbackMode === "direct"
            ? "The student asked directly. Give the direct answer first, then one tiny example."
            : "Teach the student's actual topic like a buddy. Start simple, use one familiar analogy, and keep it conversational."
    });

    return {
      conceptId: request.conceptId,
      tutorTurn: {
        assistantText,
        spokenText: assistantText,
        followUpQuestion: buildGeneralFollowUp(fallbackMode),
        understandingCheck: "Apne words mein ek line mein batao, tumhe kya samajh aaya?",
        visualId: "general-tutor",
        visual: skippedVisual(),
        citations: [],
        fallbackMode
      }
    };
  }

  const explanationLead =
    fallbackMode === "slow-down"
      ? `${lessonPack.everydayHook} ${lessonPack.analogy.setup}`
      : fallbackMode === "direct"
        ? lessonPack.definition
        : `${lessonPack.everydayHook} ${lessonPack.analogy.setup}`;

  const assistantText = await generateTutorCopy({
    systemPrompt,
    messages: request.messages,
    lessonSummary: `${explanationLead} ${lessonPack.recapBullets.join(" ")}`,
    latestUserMessage,
    coachingGoal: buildCoachingGoal(request.conceptId, latestUserMessage, fallbackMode)
  });
  const visual = await generateMotionVisual({
    conceptId: request.conceptId,
    latestUserMessage,
    assistantText
  });

  return {
    conceptId: request.conceptId,
    tutorTurn: {
      assistantText,
      spokenText: assistantText,
      followUpQuestion: buildFollowUpQuestion(request.conceptId, fallbackMode),
      understandingCheck: lessonPack.checkpoints[0]?.question ?? "Ab tum isko apne words me batao.",
      visualId: getVisualHintForConcept(request.conceptId).visualId,
      visual,
      citations: ["NCERT Class 9 Science, Motion", "Vidya AI curated motion pack"],
      fallbackMode
    }
  };
}
