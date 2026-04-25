import { describe, expect, it } from "vitest";
import { generateTutorTurn } from "@/core/tutoring/orchestrator";

describe("generateTutorTurn", () => {
  it("returns a slow-down response when the student is confused", async () => {
    const result = await generateTutorTurn({
      sessionId: "s1",
      conceptId: "speed-velocity",
      inputMode: "text",
      understandingSignal: "still-confused",
      messages: [{ role: "user", content: "Mujhe samajh nahi aaya." }]
    });

    expect(result.tutorTurn.fallbackMode).toBe("slow-down");
    expect(result.tutorTurn.visualId).toBeTruthy();
  });

  it("returns a direct response when the student asks for a direct definition", async () => {
    const result = await generateTutorTurn({
      sessionId: "s2",
      conceptId: "distance-displacement",
      inputMode: "text",
      messages: [{ role: "user", content: "Direct definition bata do." }]
    });

    expect(result.tutorTurn.fallbackMode).toBe("direct");
  });

  it("does not force Motion content for a general study question", async () => {
    const result = await generateTutorTurn({
      sessionId: "s3",
      conceptId: "speed-velocity",
      inputMode: "text",
      messages: [{ role: "user", content: "photosynthesis simple way mein samjhao" }]
    });

    expect(result.tutorTurn.visualId).toBe("general-tutor");
    expect(result.tutorTurn.citations).toEqual([]);
  });
});
