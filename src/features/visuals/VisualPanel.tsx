"use client";

import { motion } from "framer-motion";
import type { TutorVisual } from "@/types/session";

interface VisualPanelProps {
  assistantText: string;
  isOpen: boolean;
  onClose: () => void;
  visual: TutorVisual | null;
}

function visualLabel(visual: TutorVisual): string {
  if (visual.kind === "generated") {
    return "Generated visual";
  }

  if (visual.status === "ready") {
    return "Static visual";
  }

  return "Fallback visual";
}

export function VisualPanel({ assistantText, isOpen, onClose, visual }: VisualPanelProps) {
  if (!isOpen || !visual || visual.kind === "none" || !visual.url) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b1018]/86 shadow-2xl backdrop-blur-2xl lg:max-h-[calc(100svh-6rem)]"
      aria-label="Visualization panel"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">{visualLabel(visual)}</p>
          <h2 className="mt-2 text-lg font-semibold leading-tight text-white">
            {visual.title ?? "Visual explanation"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-sm font-semibold text-white/60 transition hover:bg-white/[0.1] hover:text-white"
          aria-label="Close visualization panel"
          title="Close visualization"
        >
          X
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-white/10 bg-[#070a0f] p-3">
          <img src={visual.url} alt={visual.altText} className="max-h-full max-w-full object-contain" />
        </div>

        {visual.status !== "ready" ? (
          <p className="mt-3 rounded-lg border border-amber-300/25 bg-amber-400/12 px-3 py-2 text-xs leading-5 text-amber-100">
            Using fallback visual: {visual.errorMessage ?? "generation was skipped."}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          <section className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">What to notice</p>
            <p className="mt-2 text-sm leading-6 text-white/62">{visual.altText}</p>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Vidya said</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{assistantText}</p>
          </section>
        </div>
      </div>
    </motion.aside>
  );
}
