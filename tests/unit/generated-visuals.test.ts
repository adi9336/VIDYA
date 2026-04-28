import { describe, expect, it } from "vitest";
import {
  buildMotionVisualPrompt,
  createVisualPromptHash,
  skippedVisual,
} from "@/features/visuals/server/generated-visuals";

describe("generated visual helpers", () => {
  it("builds stable cache hashes for identical prompts", () => {
    const prompt = buildMotionVisualPrompt({
      conceptId: "speed-velocity",
      latestUserMessage: "speed aur velocity mein farq kya hai?",
      assistantText: "Dono fastness se related hain, but velocity direction bhi pakadti hai."
    });

    expect(createVisualPromptHash(prompt)).toBe(createVisualPromptHash(prompt));
    expect(createVisualPromptHash(prompt)).toHaveLength(16);
  });

  it("represents skipped non-learning visuals without an image URL", () => {
    const visual = skippedVisual();

    expect(visual.kind).toBe("none");
    expect(visual.status).toBe("skipped");
    expect(visual.url).toBeUndefined();
  });
});
