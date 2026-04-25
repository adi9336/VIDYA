import { env } from "@/lib/env";
import { elevenLabsSynthesize, elevenLabsTranscribe, hasElevenLabsConfig } from "@/lib/providers/elevenlabs";
import { getOpenAIClient, hasOpenAIConfig } from "@/lib/providers/openai-client";
import type { SpeechToTextResponse, TextToSpeechResponse } from "@/types/api";

function mockTranscription(): SpeechToTextResponse {
  return {
    transcript: "Mujhe speed aur velocity ka difference samajhna hai.",
    languageGuess: "hinglish",
    confidence: 0.51
  };
}

export async function transcribeAudio(file?: File): Promise<SpeechToTextResponse> {
  if (env.speechToTextProvider === "mock") {
    return mockTranscription();
  }

  if (!file) {
    throw new Error("No audio file was provided for transcription.");
  }

  if (env.speechToTextProvider === "elevenlabs") {
    if (!hasElevenLabsConfig()) {
      return mockTranscription();
    }

    const transcription = await elevenLabsTranscribe(file);
    return {
      transcript: transcription.text,
      languageGuess: transcription.language_code ?? "auto",
      confidence: transcription.language_probability ?? 0.9
    };
  }

  if (env.speechToTextProvider === "openai") {
    if (!hasOpenAIConfig()) {
      return mockTranscription();
    }

    const client = getOpenAIClient();
    const transcription = await client.audio.transcriptions.create({
      file,
      model: env.openAiTranscribeModel,
      response_format: "json"
    });

    return {
      transcript: transcription.text,
      languageGuess: "auto",
      confidence: 0.9
    };
  }

  throw new Error(`Unsupported speech-to-text provider: ${env.speechToTextProvider}`);
}

export async function synthesizeSpeech(text: string): Promise<TextToSpeechResponse> {
  const durationMs = Math.max(1600, text.length * 45);
  return {
    audioUrl: `/api/tts?text=${encodeURIComponent(text)}`,
    durationMs
  };
}

export async function synthesizeSpeechAudio(text: string): Promise<{
  contentType: string;
  buffer: Buffer;
}> {
  if (env.textToSpeechProvider === "mock") {
    return {
      contentType: "audio/mpeg",
      buffer: Buffer.alloc(0)
    };
  }

  if (env.textToSpeechProvider === "elevenlabs") {
    if (!hasElevenLabsConfig()) {
      return {
        contentType: "audio/mpeg",
        buffer: Buffer.alloc(0)
      };
    }

    return {
      contentType: "audio/mpeg",
      buffer: await elevenLabsSynthesize(text)
    };
  }

  if (!hasOpenAIConfig()) {
    return {
      contentType: "audio/mpeg",
      buffer: Buffer.alloc(0)
    };
  }

  if (env.textToSpeechProvider === "openai") {
    const client = getOpenAIClient();
    const speech = await client.audio.speech.create({
      model: env.openAiTtsModel,
      voice: env.openAiTtsVoice,
      input: text,
      instructions: "Speak like a warm, patient senior student helping a Class 9 learner in natural Hinglish.",
      response_format: "mp3"
    });

    return {
      contentType: "audio/mpeg",
      buffer: Buffer.from(await speech.arrayBuffer())
    };
  }

  throw new Error(`Unsupported text-to-speech provider: ${env.textToSpeechProvider}`);
}
