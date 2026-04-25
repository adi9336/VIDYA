# Vidya AI Research Program

This folder adapts the operating pattern of `karpathy/autoresearch` for tutoring quality work.

## Goal

Improve one concept pack at a time for the Class 9 Motion MVP.

## Fixed rules

- Work on exactly one concept per run.
- Keep source grounding explicit and reviewable.
- Improve tutoring artifacts, not training code.
- Prefer better clarity and safer explanations over broader scope.
- Keep a keep-or-discard result for each run.

## Required outputs per run

- `sources.md`
- `concept-map.md`
- `misconceptions.md`
- `analogy-bank.md`
- `lesson-flow.json`
- `quiz.json`
- `teacher-prompt.md`
- `visual-brief.md`
- `claim-check.md`
- `scorecard.json`

## Scoring rubric

Each run is scored on:

- factual grounding
- Socratic quality
- analogy quality
- Hinglish quality
- confusion recovery
- answer-dumping avoidance

## Workflow

1. Select one concept from `research/topics/`.
2. Review the topic brief and scenarios.
3. Produce a candidate lesson pack in a new run folder.
4. Score it against the rubric.
5. Mark the run `keep` or `discard` in `research/results.tsv`.
