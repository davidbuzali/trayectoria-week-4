# Mechanical testing record

## Scope

The mechanical pass covered the fictional evaluator workflow, the institutional decision gate, deterministic route calculations, the controlled AI endpoint, and the deployed Vercel surface.

## Automated result

`pnpm run check` passes TypeScript validation, the Vite production build, and nine tests. The tests cover rationale validation, all-proposals resolution, returned-credit exclusion, the written-decision lock, deterministic route arithmetic, request allowlisting, the API response contract, provenance fields, and visible safety boundaries.

## Genuine defect found

The first production endpoint returned proposal objects with `proposalId` and `explanation`, while the client attempted to read `id` and `aiExplanation`. The request succeeded, but “Actualizar propuestas de IA” could not merge the returned explanations into the displayed records.

## Correction and regression evidence

The client now maps the endpoint contract explicitly:

- `proposalId` selects the existing allowlisted record;
- `explanation` becomes `aiExplanation`;
- `missingEvidence` replaces only the provisional missing-evidence list;
- human reviews remain untouched.

`tests/api-contract.test.mjs` locks the response shape and verifies rejection of IDs outside the allowlist. All nine tests passed after the correction.

## Deployment evidence

- Deployment 1 exposed the real contract defect.
- Deployment 2 contained commit `67f9428` and passed public HTTP and endpoint checks.
- Stable production alias: <https://week-4-trajectory-verification.vercel.app>
