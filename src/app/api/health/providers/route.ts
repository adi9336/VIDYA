import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    modelProvider: env.modelProvider,
    speechToTextProvider: env.speechToTextProvider,
    textToSpeechProvider: env.textToSpeechProvider,
    hasOpenAIKey: Boolean(env.openAiApiKey),
    hasElevenLabsKey: Boolean(env.elevenLabsApiKey),
    openAiTextModel: env.openAiTextModel,
    visualGenerationProvider: env.visualGenerationProvider,
    openAiImageModel: env.openAiImageModel,
    openAiImageSize: env.openAiImageSize,
    openAiImageQuality: env.openAiImageQuality,
    elevenLabsTtsModel: env.elevenLabsTtsModel,
    elevenLabsVoiceId: env.elevenLabsVoiceId
  });
}
