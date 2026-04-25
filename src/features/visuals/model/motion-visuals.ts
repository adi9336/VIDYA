import {
  getMotionConceptPack,
  listMotionConceptPacks,
  type MotionConceptId,
  type MotionVisualStage,
} from "../../../core/content/motion";

export type MotionIllustrationId =
  | "distance-displacement"
  | "speed-velocity"
  | "acceleration";

export type MotionIllustrationAsset = {
  illustrationId: MotionIllustrationId;
  conceptId: MotionConceptId;
  title: string;
  assetPath: string;
  altText: string;
  sceneIds: string[];
  stages: MotionVisualStage[];
};

const motionIllustrationAssets: readonly MotionIllustrationAsset[] = [
  {
    illustrationId: "distance-displacement",
    conceptId: "distance-displacement",
    title: "Loop walk path vs straight displacement",
    assetPath: "/illustrations/motion-distance-displacement.svg",
    altText:
      "A student walks around a circular park path while a straight arrow shows the net displacement between start and end points.",
    sceneIds: [
      "distance-displacement-loop",
      "distance-displacement-chord",
      "distance-displacement-summary",
    ],
    stages: ["hook", "compare", "recap"],
  },
  {
    illustrationId: "speed-velocity",
    conceptId: "speed-velocity",
    title: "Equal speed with opposite directions",
    assetPath: "/illustrations/motion-speed-velocity.svg",
    altText:
      "Two riders move with equal speed values while arrows point in opposite directions to show different velocities.",
    sceneIds: [
      "speed-velocity-bikes",
      "speed-velocity-arrows",
      "speed-velocity-signpost",
    ],
    stages: ["hook", "explain", "checkpoint"],
  },
  {
    illustrationId: "acceleration",
    conceptId: "acceleration",
    title: "Changing velocity over time",
    assetPath: "/illustrations/motion-acceleration.svg",
    altText:
      "A bus speeds up and slows down with changing arrows and a simple graph indicating velocity changing over time.",
    sceneIds: [
      "acceleration-bus-start-stop",
      "acceleration-speed-graph",
      "acceleration-turning-arrow",
    ],
    stages: ["hook", "explain", "recap"],
  },
] as const;

const assetsByConcept = new Map<MotionConceptId, MotionIllustrationAsset>(
  motionIllustrationAssets.map((asset) => [asset.conceptId, asset]),
);

const assetsByScene = new Map<string, MotionIllustrationAsset>();

for (const asset of motionIllustrationAssets) {
  for (const sceneId of asset.sceneIds) {
    assetsByScene.set(sceneId, asset);
  }
}

export function listMotionIllustrationAssets(): readonly MotionIllustrationAsset[] {
  return motionIllustrationAssets;
}

export function getMotionIllustrationAsset(
  conceptId: MotionConceptId,
): MotionIllustrationAsset {
  return assetsByConcept.get(conceptId) ?? motionIllustrationAssets[0];
}

export function getMotionIllustrationForScene(
  sceneId: string,
): MotionIllustrationAsset | null {
  return assetsByScene.get(sceneId) ?? null;
}

export function resolveMotionVisualStage(
  conceptId: MotionConceptId,
  stage: MotionVisualStage,
): {
  conceptId: MotionConceptId;
  stage: MotionVisualStage;
  sceneId: string;
  asset: MotionIllustrationAsset;
} {
  const pack = getMotionConceptPack(conceptId);
  const cue =
    pack.visualCues.find((item) => item.stage === stage) ?? pack.visualCues[0];
  const asset =
    getMotionIllustrationForScene(cue.sceneId) ?? getMotionIllustrationAsset(conceptId);

  return {
    conceptId,
    stage,
    sceneId: cue.sceneId,
    asset,
  };
}

export function listMotionVisualMappings(): Array<{
  conceptId: MotionConceptId;
  title: string;
  stages: MotionVisualStage[];
  assetPath: string;
}> {
  return listMotionConceptPacks().map((pack) => {
    const asset = getMotionIllustrationAsset(pack.id);

    return {
      conceptId: pack.id,
      title: pack.title,
      stages: asset.stages,
      assetPath: asset.assetPath,
    };
  });
}
