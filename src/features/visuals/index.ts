import { getMotionIllustrationAsset } from "./model/motion-visuals";

export {
  getMotionIllustrationAsset,
  getMotionIllustrationForScene,
  listMotionIllustrationAssets,
  listMotionVisualMappings,
  resolveMotionVisualStage,
} from "./model/motion-visuals";

export type {
  MotionIllustrationAsset,
  MotionIllustrationId,
} from "./model/motion-visuals";

export function getVisualHintForConcept(conceptId: import("@/core/content/motion").MotionConceptId) {
  const asset = getMotionIllustrationAsset(conceptId);
  return {
    visualId: asset.illustrationId,
    title: asset.title,
    altText: asset.altText
  };
}
