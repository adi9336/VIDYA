import { synthesizeSpeechAudio } from "@/lib/providers/speech";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") ?? "Vidya AI reply";
    const audio = await synthesizeSpeechAudio(text);

    if (audio.buffer.length === 0) {
      return new Response(null, { status: 204 });
    }

    return new Response(new Uint8Array(audio.buffer), {
      headers: {
        "Content-Type": audio.contentType,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to synthesize speech.";
    console.warn("[tts] Speech synthesis unavailable:", message);
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
        "X-Vidya-TTS-Status": "unavailable"
      }
    });
  }
}
