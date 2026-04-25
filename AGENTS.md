# Agent Instructions

This repository is being built from scratch with Codex assistance.

## Priorities

1. Keep the repo simple and production-oriented.
2. Prefer small, focused files over large generic modules.
3. Validate assumptions before adding abstractions.
4. Add tests for meaningful logic before or alongside implementation.
5. Keep secrets out of the repository.

## Product Behavior

- Vidya AI is a senior buddy first, not a Motion-only tutor.
- Default experience should feel like a cool, helpful Hinglish companion who can chat, motivate, plan, and help with studies.
- Teaching mode should activate only when the student asks to learn, solve, revise, explain, compare, or check an answer.
- Motion content is a specialist pack, not the product identity. Use it only for Motion-related questions.
- Do not make greetings, empty states, metadata, docs, or prompts pull the user back to Motion unless the current task is explicitly about Motion.

## Working Style

- Read `WORKING-CONTEXT.md` before large changes.
- Follow `RULES.md` before editing code.
- Update docs when behavior or architecture changes.
- Prefer feature-based structure inside `src/`.
- Put reusable utilities in `src/lib/` only when they are shared by multiple features.

## Delivery Rules

- New features should usually include:
  - implementation
  - minimal tests
  - docs or context updates if behavior changed
- Avoid placeholder complexity unless it clearly supports the next implementation step.
