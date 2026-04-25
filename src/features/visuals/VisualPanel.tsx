import Image from "next/image";
import { motionConcepts } from "@/core/concepts/motion";
import { getMotionConceptPack } from "@/core/content/motion";
import { getMotionIllustrationAsset } from "@/features/visuals";
import type { ConceptId } from "@/types/session";

interface VisualPanelProps {
  conceptId: ConceptId;
  visualId?: string;
}

export function VisualPanel({ conceptId }: VisualPanelProps) {
  const asset = getMotionIllustrationAsset(conceptId);
  const pack = getMotionConceptPack(conceptId);
  const concept = motionConcepts.find((item) => item.id === conceptId) ?? motionConcepts[0];
  const misconception = pack.misconceptions[0];
  const recap = pack.recapBullets.slice(0, 3);

  return (
    <aside className="panel visual-panel">
      <div className="panel-header">
        <div>
          <p className="panel-label">Visual support</p>
          <h2>{concept.title}</h2>
        </div>
      </div>

      <div className="visual-frame">
        <Image
          src={asset.assetPath}
          alt={asset.altText}
          width={640}
          height={420}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>

      <div className="visual-meta">
        <p>
          <strong>{asset.title}</strong>
        </p>
        <p>{pack.definition}</p>

        <div className="visual-insight-grid">
          <article className="insight-card">
            <span className="insight-label">Trap students fall into</span>
            <strong>{misconception?.belief}</strong>
            <p>{misconception?.correctionAngle}</p>
          </article>

          <article className="insight-card">
            <span className="insight-label">Try this check</span>
            <strong>{pack.checkpoints[0]?.question ?? "Ab apne words me samjhao."}</strong>
            <p>{pack.checkpoints[0]?.hint}</p>
          </article>
        </div>

        <div className="recap-stack">
          {recap.map((item) => (
            <div key={item} className="recap-pill">
              {item}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
