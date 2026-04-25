import { NextResponse } from "next/server";
import { z } from "zod";
import { generateTutorTurn } from "@/core/tutoring/orchestrator";

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string()
});

const chatRequestSchema = z.object({
  sessionId: z.string(),
  conceptId: z.enum(["distance-displacement", "speed-velocity", "acceleration"]),
  messages: z.array(messageSchema),
  inputMode: z.enum(["text", "voice"]),
  understandingSignal: z.enum(["understood", "still-confused", "curious"]).optional()
});

export async function POST(request: Request) {
  try {
    const payload = chatRequestSchema.parse(await request.json());
    const response = await generateTutorTurn(payload);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate tutor response.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
