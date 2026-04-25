# Agent Instructions

This repository is being built from scratch with Codex assistance.

## Priorities

1. Keep the repo simple and production-oriented.
2. Prefer small, focused files over large generic modules.
3. Validate assumptions before adding abstractions.
4. Add tests for meaningful logic before or alongside implementation.
5. Keep secrets out of the repository.

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
