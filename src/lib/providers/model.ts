import { env } from "@/lib/env";
import { getOpenAIClient, hasOpenAIConfig } from "@/lib/providers/openai-client";
import type { Message } from "@/types/session";

export interface ModelPromptInput {
  systemPrompt: string;
  messages: Message[];
  lessonSummary: string;
  latestUserMessage: string;
  coachingGoal: string;
}

function buildMockTutorCopy(input: ModelPromptInput): string {
  const lastUserMessage = input.latestUserMessage || [...input.messages].reverse().find((message) => message.role === "user")?.content;

  if (input.lessonSummary.startsWith("GENERAL_TUTORING_CONTEXT")) {
    if (/definition|direct|seedha|bas bata|sidha/i.test(lastUserMessage ?? "")) {
      return "Seedha bolun toh, pehle exact meaning pakadte hain. Isko ek simple daily-life example se jod do, toh concept easy ho jaata hai.";
    }

    return lastUserMessage
      ? `Samjha, tum pooch rahe ho: "${lastUserMessage}". Isko ek chhote example se pakadte hain, phir step by step clear karte hain.`
      : "Bolo, kis topic mein help chahiye? Main simple example se samjha dunga.";
  }

  return [
    /definition|direct|seedha|bas bata|sidha/i.test(lastUserMessage ?? "")
      ? "Seedha bata deta hoon."
      : "Pehle ek chhoti si situation socho.",
    input.coachingGoal,
    input.lessonSummary,
    lastUserMessage ? `Tumne poocha tha: "${lastUserMessage}"` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export async function generateTutorCopy(input: ModelPromptInput): Promise<string> {
  if (env.modelProvider === "mock") {
    return buildMockTutorCopy(input);
  }

  if (!hasOpenAIConfig()) {
    return buildMockTutorCopy(input);
  }

  const client = getOpenAIClient();
  const conversation = input.messages.slice(-6).map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n");

  const response = await client.responses.create({
    model: env.openAiTextModel,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: `${input.systemPrompt}

Lesson context:
${input.lessonSummary}

Current coaching goal:
${input.coachingGoal}

Student's latest message:
${input.latestUserMessage}

Return only the tutor reply text.

Output requirements:
- 2 to 5 short sentences
- natural Hinglish
- unless the student asked for direct/definition, sentence 1 must be a lived-experience question or tiny situation, not a definition
- if the student asked for direct/definition, sentence 1 can be the direct answer
- use one daily-life analogy only; do not switch examples
- no bullet points
- no formal textbook tone
- no follow-up question
- no repeated stock opener`
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: conversation
          }
        ]
      }
    ]
  });

  const text = response.output_text?.trim();
  return text && text.length > 0 ? text : buildMockTutorCopy(input);
}
