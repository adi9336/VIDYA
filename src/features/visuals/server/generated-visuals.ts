import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMotionConceptPack } from "@/core/content/motion";
import { getMotionIllustrationAsset } from "@/features/visuals";
import { env } from "@/lib/env";
import { getOpenAIClient, hasOpenAIConfig } from "@/lib/providers/openai-client";
import type { MotionConceptId } from "@/core/content/motion";
import type { TutorVisual } from "@/types/session";

interface MotionVisualInput {
  conceptId: MotionConceptId;
  latestUserMessage: string;
  assistantText: string;
}

const generatedVisualDirectory = path.join(process.cwd(), "public", "generated", "visuals");

export function buildMotionVisualPrompt(input: MotionVisualInput): string {
  const pack = getMotionConceptPack(input.conceptId);
  const asset = getMotionIllustrationAsset(input.conceptId);

  return [
    "Create one clean educational diagram for an Indian school student.",
    "Style: modern flat vector illustration, dark friendly app background, high contrast, uncluttered.",
    "Use minimal English labels only when needed. Avoid long paragraphs in the image.",
    "Do not add formulas, numbers, or facts unless they are directly supported by the concept context.",
    `Concept: ${pack.title}.`,
    `Reference visual idea: ${asset.altText}`,
    `Student asked: ${input.latestUserMessage}`,
    `Tutor explanation to support: ${input.assistantText}`,
    "The image should make the concept easier to understand at a glance."
  ].join("\n");
}

export function createVisualPromptHash(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Image generation timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

function staticMotionVisual(conceptId: MotionConceptId, status: TutorVisual["status"], errorMessage?: string): TutorVisual {
  const asset = getMotionIllustrationAsset(conceptId);

  return {
    kind: "static",
    status,
    url: asset.assetPath,
    title: asset.title,
    altText: asset.altText,
    errorMessage
  };
}

export async function generateMotionVisual(input: MotionVisualInput): Promise<TutorVisual> {
  const prompt = buildMotionVisualPrompt(input);
  const promptHash = createVisualPromptHash(prompt);
  const publicUrl = `/generated/visuals/${promptHash}.png`;
  const outputPath = path.join(generatedVisualDirectory, `${promptHash}.png`);

  if (existsSync(outputPath)) {
    return {
      ...staticMotionVisual(input.conceptId, "ready"),
      kind: "generated",
      url: publicUrl,
      promptHash
    };
  }

  if (env.visualGenerationProvider !== "openai" || !hasOpenAIConfig()) {
    return staticMotionVisual(input.conceptId, "skipped", "OpenAI image generation is not configured.");
  }

  try {
    const client = getOpenAIClient();
    const response = await withTimeout(
      client.images.generate({
        model: env.openAiImageModel,
        prompt,
        size: env.openAiImageSize as "1024x1024",
        quality: env.openAiImageQuality as "low" | "medium" | "high" | "auto",
        n: 1
      }),
      env.openAiImageTimeoutMs
    );
    const imageBase64 = response.data?.[0]?.b64_json;

    if (!imageBase64) {
      return staticMotionVisual(input.conceptId, "error", "OpenAI did not return image data.");
    }

    await mkdir(generatedVisualDirectory, { recursive: true });
    await writeFile(outputPath, Buffer.from(imageBase64, "base64"));

    return {
      ...staticMotionVisual(input.conceptId, "ready"),
      kind: "generated",
      url: publicUrl,
      promptHash
    };
  } catch (error) {
    return staticMotionVisual(
      input.conceptId,
      "error",
      error instanceof Error ? error.message : "Image generation failed."
    );
  }
}

export function skippedVisual(): TutorVisual {
  return {
    kind: "none",
    status: "skipped",
    altText: "No visualization is needed for this response."
  };
}
