import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/providers/speech";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const audio = formData.get("audio");

      if (audio instanceof File) {
        return NextResponse.json(await transcribeAudio(audio));
      }
    }

    return NextResponse.json(await transcribeAudio());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to transcribe audio.";
    console.warn("[stt] Speech transcription unavailable:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
