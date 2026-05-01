# Visualization Panel Plan

## Goal

Add a companion visualization panel beside the chat so that when Vidya generates a reply with visual support, the image opens next to the conversation instead of being buried under the messages.

## Product Rules

- Keep Vidya buddy-first. Do not show Motion visuals for casual chat or general study coaching.
- Use the existing `TutorVisual` returned by `/api/chat` as the source of truth.
- Show generated OpenAI visuals when available and static Motion SVG fallbacks when generation is skipped or fails.
- Keep the panel contextual to the latest tutor turn, with the assistant reply as the short explanation anchor.

## Implementation Steps

1. Rework `src/features/visuals/VisualPanel.tsx`.
   - Accept `visual`, `conceptId`, `assistantText`, `isOpen`, and `onClose`.
   - Render nothing when there is no usable visual.
   - Show image, title, alt/explanation text, generated/static status, fallback warning, and the latest reply excerpt.

2. Update `src/features/tutor/client/TutorExperience.tsx`.
   - Track the latest assistant reply used by the panel.
   - Open the panel automatically when `/api/chat` returns a visual.
   - Replace the old bottom visual card with the side panel.
   - Use a responsive layout: chat + panel side by side on large screens, stacked on smaller screens.

3. Verify.
   - Run TypeScript/test checks.
   - Confirm non-Motion/general turns do not open the panel.
   - Confirm Motion turns use generated/static visual data without changing backend behavior.

## Later Enhancements

- LiveKit event integration for realtime `vidya.visual_request` streams.
- More subject-specific visual packs beyond Motion.
- Step-by-step visual stages synced to the tutor explanation.
