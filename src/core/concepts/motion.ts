import type { ConceptId } from "@/types/session";

export interface MotionConceptSummary {
  id: ConceptId;
  title: string;
  shortPitch: string;
}

export const motionConcepts: MotionConceptSummary[] = [
  {
    id: "distance-displacement",
    title: "Distance vs Displacement",
    shortPitch: "Help students see why path length and final position are not the same thing."
  },
  {
    id: "speed-velocity",
    title: "Speed vs Velocity",
    shortPitch: "Teach magnitude versus direction with simple race and road examples."
  },
  {
    id: "acceleration",
    title: "Acceleration",
    shortPitch: "Show that changing speed or direction means motion is changing."
  }
];

export function isConceptId(value: string): value is ConceptId {
  return motionConcepts.some((concept) => concept.id === value);
}
