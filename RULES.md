# Rules

## Must Always

- Keep secrets and tokens out of source control.
- Validate inputs at system boundaries.
- Prefer clear implementations over clever ones.
- Keep modules cohesive and easy to replace.
- Write or update tests when adding logic that can regress.
- Follow existing repository patterns before introducing new ones.

## Must Never

- Hardcode credentials.
- Add dead scaffolding with no near-term use.
- Rename or reorganize large parts of the repo without reason.
- Skip documenting major assumptions.

## File Conventions

- `src/features/` holds user-facing or domain features.
- `src/core/` holds app bootstrap and composition.
- `src/lib/` holds shared utilities.
- `tests/unit/` covers isolated logic.
- `tests/integration/` covers boundaries and workflows.
