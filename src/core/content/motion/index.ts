import { accelerationPack } from "./packs/acceleration";
import { distanceDisplacementPack } from "./packs/distance-displacement";
import { speedVelocityPack } from "./packs/speed-velocity";
import type { MotionConceptId, MotionConceptPack } from "./types";

const motionConceptPacks = [
  distanceDisplacementPack,
  speedVelocityPack,
  accelerationPack,
] as const satisfies readonly MotionConceptPack[];

const motionConceptPackMap = new Map<MotionConceptId, MotionConceptPack>(
  motionConceptPacks.map((pack) => [pack.id, pack]),
);

export function getMotionConceptPack(
  conceptId: MotionConceptId,
): MotionConceptPack {
  return motionConceptPackMap.get(conceptId) ?? distanceDisplacementPack;
}

export function listMotionConceptPacks(): readonly MotionConceptPack[] {
  return motionConceptPacks;
}

export {
  accelerationPack,
  distanceDisplacementPack,
  speedVelocityPack,
  motionConceptPacks,
};

export type {
  MotionCheckpoint,
  MotionConceptId,
  MotionConceptPack,
  MotionDifficulty,
  MotionMisconception,
  MotionPrompt,
  MotionVisualCue,
  MotionVisualStage,
} from "./types";
