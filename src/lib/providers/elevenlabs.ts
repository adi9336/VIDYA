import { env } from "@/lib/env";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

export function hasElevenLabsConfig(): boolean {
  return Boolean(env.elevenLabsApiKey);
}

function getElevenLabsHeaders(contentType?: string): HeadersInit {
  if (!env.elevenLabsApiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  return {
    "xi-api-key": env.elevenLabsApiKey,
    ...(contentType ? { "Content-Type": contentType } : {})
  };
}

export async function elevenLabsTranscribe(file: File) {
  const formData = new FormData();
  formData.append("model_id", env.elevenLabsSttModel);
  formData.append("file", file);

  const response = await fetch(`${ELEVENLABS_API_BASE}/speech-to-text`, {
    method: "POST",
    headers: getElevenLabsHeaders(),
    body: formData
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs STT failed with ${response.status}.`);
  }

  return (await response.json()) as {
    text: string;
    language_code?: string;
    language_probability?: number;
  };
}

export async function elevenLabsSynthesize(text: string) {
  const response = await fetch(
    `${ELEVENLABS_API_BASE}/text-to-speech/${env.elevenLabsVoiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: getElevenLabsHeaders("application/json"),
      body: JSON.stringify({
        text,
        model_id: env.elevenLabsTtsModel
      })
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed with ${response.status}.`);
  }

  return Buffer.from(await response.arrayBuffer());
}
