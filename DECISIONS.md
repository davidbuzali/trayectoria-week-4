# Decision log

## 2026-09-02 - Packet before code

- Locked the Week 4 slice as the evaluator-verification workflow assigned to David in the team Blueprint.
- Defined the operational user as an authorized university course-equivalency evaluator; Diego remains the fictional beneficiary and final decision-maker.
- Bounded the demonstration to one fictional destination institution and three fictional Industrial Engineering course proposals.
- Made the institutional sequence non-negotiable: AI proposes, the evaluator confirms or returns, the institution issues a written decision, and only then may the deterministic calculator act.
- Selected Transferology as the global benchmark while rejecting its match-percentage ranking mechanic for this product.
- Treated Mexico's SERE and RVOE systems as complementary official infrastructure rather than something the prototype claims to replace.
- Preserved the Blueprint's open-future firewall: no best-option label, no hidden ranking, no prediction, equal visual weight, and no removal of an ambitious route merely because it is currently unaffordable.
- Chose fictional typed structured data and session-local state for the academic slice. No real personal data or permanent user database will be used.
- Placed the LLM behind a server-side, schema-validated proposal boundary. Model output cannot set institutional status, issue a decision, or calculate a route.
- Required one documented mechanical defect and one synthetic-evaluator persona test before the final deployment.

### Tomorrow's first move

Turn `docs/PACKET.md` into a precise implementation prompt with small acceptance-tested features and a minimum five-commit, two-deployment plan before writing product code.

## 2026-09-02 - Implementation contract

- Converted the approved packet into a coding-agent prompt without starting product code.
- Required a standalone Week 4 repository under `~/crystal-ball/cuaderno` so Week 4 work cannot be committed to the Week 2 or Week 3 repository.
- Defined three typed fictional equivalency records and the complete guarded workflow from evidence load through calculation.
- Chose explicit live and simulated LLM modes. Both are non-binding, server-bounded, schema-validated, and unable to change human or institutional state.
- Added acceptance criteria for the evaluator view, written-decision gate, deterministic calculation, open-future protection, Diego preview, accessibility, and failure states.
- Expanded the minimum plan to seven coherent commits and three deployment checkpoints: working slice, mechanical fix, and persona fix.
- Prohibited intentionally inserting a defect merely to satisfy the mechanical test requirement.

### Tomorrow's first move

Move the standalone Week 4 folder into `~/crystal-ball/cuaderno`, initialize its Git repository and GitHub remote, commit the packet and implementation prompt, and only then scaffold the product.

## 2026-09-02 - Working slice and mechanical verification

- Implemented the bounded evaluator workspace with three fictional equivalency records, visible sources, dates, missing evidence, and provisional AI explanations.
- Required a written rationale for every human confirmation or return; all three reviews must be resolved before a separate institutional-decision action becomes available.
- Invalidated the institutional decision whenever an evaluator changes a review.
- Kept route arithmetic deterministic and excluded every returned proposal from the accepted-credit total.
- Presented the stay and transfer routes with equal visual weight, explicit assumptions, affordability context, and Diego's right to reject both.
- Added a small WebMCP action that uses the same review validation and state transition as the visible evaluator controls when the browser supports the API.
- Created a controlled server endpoint with allowlisted fictional records, schema validation, simulated fallback, and no authority over review or calculation state.
- Completed the first Vercel deployment, then found a real response-contract defect: the API returned `proposalId` and `explanation`, while the interface expected `id` and `aiExplanation`.
- Added a regression test, corrected the interface mapping, and completed the second production deployment.
- Verified the production page and simulated endpoint respond successfully at `https://week-4-trajectory-verification.vercel.app`.
- Kept the OpenAI API optional. The deployed prototype defaults to controlled simulation unless server-side live-mode variables are explicitly configured.

### Next validation move

Run the required synthetic-evaluator persona test in a fresh chat, record the evidence and any resulting correction, then create the final Vercel deployment.
