import { describe, expect, it } from "vitest";
import { motionConcepts } from "@/core/concepts/motion";
import { getMotionConceptPack } from "@/core/content/motion";
import { getMotionIllustrationAsset } from "@/features/visuals";

describe("motion content contracts", () => {
  it("covers every registered concept with a lesson pack and visual", () => {
    for (const concept of motionConcepts) {
      const pack = getMotionConceptPack(concept.id);
      const visual = getMotionIllustrationAsset(concept.id);

      expect(pack.definition.length).toBeGreaterThan(10);
      expect(pack.checkpoints.length).toBeGreaterThan(0);
      expect(visual.altText.length).toBeGreaterThan(10);
    }
  });
});
