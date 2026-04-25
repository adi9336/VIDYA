import OpenAI from "openai";
import { env } from "@/lib/env";

let cachedClient: OpenAI | null = null;

export function hasOpenAIConfig(): boolean {
  return Boolean(env.openAiApiKey);
}

export function getOpenAIClient(): OpenAI {
  if (!env.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: env.openAiApiKey
    });
  }

  return cachedClient;
}
