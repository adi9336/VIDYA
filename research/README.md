# Research Workflow

This directory holds the offline tutoring-quality loop for Vidya AI.

It is inspired by the workflow discipline of `karpathy/autoresearch`, but it does not reuse the training stack. The editable surface here is the tutoring content and prompt artifacts, not model-training code.

## Layout

- `program.md` - the operating rules for the research loop
- `topics/` - one topic brief per Motion concept
- `scenarios/` - fixed student scenarios used for evaluation
- `runs/` - output folders for concrete experiment runs
- `results.tsv` - append-only summary log
- `evals/` - scoring rubric and sample output shapes

## How to use

1. Pick one topic brief.
2. Create a timestamped run directory under `runs/`.
3. Fill the required tutoring artifacts.
4. Score them with the rubric.
5. Append a row to `results.tsv`.
