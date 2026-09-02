# Coding-Agent Implementation Prompt

You are building the Week 4 **Trayectoria evaluator-verification workflow** for David Buzali. Read `docs/PACKET.md` completely before touching product code. Treat it as the source of truth. Preserve `docs/assets/evaluator-verification-mockup.png` as the visual reference and preserve the decisions in `DECISIONS.md`.

## Preflight

1. Work only inside the standalone `week-4-trajectory-verification` project. Do not modify the Week 2 `Prueba Clara` project or the Week 3 `Family Shield` project.
2. Before building, confirm that this project lives under `~/crystal-ball/cuaderno/week-4-trajectory-verification`, has its own Git repository, and has a GitHub remote. If it does not, stop and tell the user exactly what must be moved or initialized; do not commit Week 4 work into an earlier week's repository.
3. Preserve the packet and mockup. No product code may precede the packet commit.
4. Use the existing course-approved React/TypeScript web starter when available. Preserve its package manager and deployment architecture. Do not add a framework or dependency unless the slice genuinely requires it.
5. Use only fictional data and visibly label the entire experience as an academic prototype with invented records.

## Product objective

Build one working institutional workflow in which:

1. Structured transcript and syllabus evidence is loaded for the fictional student Diego N.
2. An LLM proposes three possible course equivalencies and identifies missing evidence.
3. Every model output is visibly labeled as non-binding AI output or, in fallback mode, as simulated AI output.
4. An authorized evaluator inspects the source, evidence date, credits, content evidence, and uncertainty for each proposal.
5. The evaluator confirms or returns each proposal and must record a valid rationale.
6. The institution cannot issue a written decision while any proposal is unresolved.
7. The deterministic route calculator remains locked until the written institutional decision is issued.
8. Once unlocked, the calculator uses confirmed credits only and displays unranked factual routes with exposed assumptions.

The product must never act like an AI tutor, admission authority, university ranking, destiny predictor, or recommendation engine.

## Exact users

- **Operational user:** Laura M., a fictional authorized university course-equivalency evaluator.
- **Beneficiary and final decision-maker:** Diego N., a fictional 20-year-old, first-generation Industrial Engineering student.

Laura operates the verification workflow. Diego can inspect the resulting evidence and reject every route, but he does not approve institutional equivalencies.

## Required fictional dataset

Create a small typed fixture with the following bounded records. Wording may be polished, but do not replace the actors, scope, or statuses with real data.

### Case

- Case ID: `T-014`
- Student: `Diego N.`
- Current institution: `Instituto Metropolitano` - fictional
- Destination institution: `Universidad Horizonte` - fictional
- Current program: `Ingenieria Industrial`
- Destination program: `Ingenieria Industrial`
- Documented current credits: `96`
- Destination degree credits: `240`
- Binding payment deadline: `18 Sep 2026`
- Student priority: continue toward a recognized degree without compromising household stability
- Dataset label: `Datos totalmente inventados para demostracion`

### Course proposals

Include exactly three proposals in the first slice:

1. `EQ-101`: `Investigacion de operaciones I` -> `Optimizacion de sistemas`
2. `EQ-204`: `Estadistica aplicada` -> `Estadistica para ingenieria`
3. `EQ-301`: `Procesos de manufactura` -> `Sistemas de manufactura`

Each proposal must include:

- origin and destination course IDs;
- source and target credits;
- source-document name;
- evidence date;
- two or more content-evidence items;
- zero or more missing-evidence items;
- a concise AI explanation;
- status: `pending`, `confirmed`, or `returned`;
- optional evaluator rationale, evaluator name, and decision timestamp.

Use plausible but fictional course codes, dates, credits, and evidence. Give at least one proposal a credit or content discrepancy so the return flow has a credible reason to exist.

## Required interface

Build a responsive, accessible Spanish evaluator workspace inspired by the approved mockup. Reproduce its information architecture and visual character, not its pixels.

### First viewport

The first viewport must expose the core task rather than a marketing hero:

- dark forest-green institutional header with `TRAYECTORIA` and `Verificacion institucional`;
- prominent label that all people, institutions, and records are invented;
- Diego case summary and payment deadline;
- four-step verification chain: `Propuesta de IA -> Revision humana -> Decision escrita -> Calculo de ruta`;
- at least the first course proposal and its review controls;
- institutional gate showing that calculation is locked.

### Proposal cards

Every card must display:

- origin and candidate destination course;
- source document and evidence date;
- source and target credits;
- content evidence and missing evidence;
- `Propuesta de IA` or `Propuesta de IA simulada` label;
- current human status;
- `Confirmar` and `Devolver` actions;
- evaluator-rationale input with clear validation.

When a decision is made, show the responsible fictional evaluator, rationale, and time. Keep the transformation or decision history inspectable.

### Institutional gate

The gate must show which requirements remain unresolved. It must enforce, not merely describe, these rules:

- all three proposals must be `confirmed` or `returned`;
- every resolved proposal must have a valid evaluator rationale;
- only a human action can issue the written institutional decision;
- AI output cannot change proposal status or issue the decision;
- calculation stays locked until the written decision exists.

### Result view

After the decision is issued, calculate using confirmed credits only. Show:

- accepted-transfer-credit total;
- returned courses excluded from the total;
- remaining destination credits;
- estimated semesters based on a visible fixed credits-per-semester assumption;
- current tuition assumption and evidence date;
- projected tuition arithmetic;
- current-path and transfer-path cards with equal visual weight;
- verification state and unresolved assumptions for each path.

Do not sort or rank the routes. Do not use `best`, `recommended`, match percentages, stars, approval probabilities, employability scores, or predictions. If a route exceeds Diego's fictional affordability constraint, keep it visible and show the documented gap. Unconfirmed aid may be shown only as a next step and must not be counted as available money.

### Diego preview

Provide a bounded `Vista de Diego` state or panel. It must:

- translate the written decision into plain language;
- preserve the current path and transfer path with equal visual weight;
- expose assumptions and returned courses;
- state that Diego may reject every route;
- avoid giving Diego institutional approval controls.

## State model

Represent the core flow explicitly:

```text
evidence_loaded -> proposal_ready -> under_review -> all_resolved -> decision_issued -> calculation_available
```

Do not infer authorization from UI visibility. Centralize transition guards in pure functions or a reducer so tests can prove that states cannot be skipped.

Implement at least these pure functions:

- `validateRationale(value)`
- `allProposalsResolved(proposals)`
- `institutionalDecisionBlockers(state)`
- `canIssueDecision(state)`
- `confirmedCreditTotal(proposals)`
- `routeCalculationBlockers(state)`
- `calculateRoute(confirmedCredits, assumptions)`

Evaluator rationales must be trimmed, required, and limited to 240 characters. Use an accessible inline error and never fail silently.

## LLM and structured-data boundary

Implement two explicit modes:

### Live mode

- A server-side endpoint accepts only allowlisted fictional course-record IDs, never arbitrary transcript text.
- The server loads the matching structured fixtures itself.
- It calls the configured LLM using deployment environment variables only.
- Do not hard-code a provider secret or model credential.
- Require structured output containing only candidate course ID, evidence-based explanation, and missing-evidence items.
- Validate the response shape, lengths, and referenced IDs before returning it to the interface.
- Reject invalid, oversized, out-of-set, or malformed responses safely.

### Simulated fallback mode

- If live mode is not configured or the model request fails, load the deterministic fixture proposals.
- Label this output on screen as `Salida de IA simulada`.
- Never pretend the fallback is a live model result.
- Failure or fallback must not unlock any human or institutional gate.

Keep the provider adapter small. The evaluator workflow, tests, and live demo must remain usable without exposing a secret.

## Security requirements

- No secrets in source, logs, screenshots, fixtures, generated PDFs, or Git history.
- Keep provider keys and configuration in deployment environment variables only.
- Commit a `.env.example` containing variable names and safe placeholder values, never a real key.
- Store no real personal data and no production documents.
- Do not add authentication or a database to this slice because it stores no personal records. Document that authentication plus Row Level Security become mandatory before persistence is introduced.
- Validate every request, record ID, model response, and evaluator rationale.
- Do not send raw free-form evaluator text to the model.
- Escape or render model output as text; never inject returned HTML.
- Ensure the data model contains no socioeconomic proxies, contact graph, neighborhood proxy, writing-style inference, response-speed inference, ranking, admission probability, or outcome prediction.

## Accessibility and responsive behavior

- Use semantic headings, buttons, forms, labels, lists, and status regions.
- Provide visible keyboard focus.
- Do not rely on color alone for status.
- Use `aria-live` or an equivalent status announcement for validation and decision changes.
- Keep the full evaluator task operable with a keyboard.
- On narrow screens, preserve the workflow order, evidence labels, and gate state without horizontal scrolling.
- Respect reduced-motion preferences if motion is introduced.

## Acceptance criteria

The feature is complete only when all of these pass:

1. The production build completes successfully.
2. The server-rendered page identifies Trayectoria, the fictional case, simulated/live AI boundary, human review, and locked calculator.
3. Three structured proposals render with source, evidence date, credits, and status.
4. Empty or oversized rationales are rejected with accessible feedback.
5. A pending proposal blocks the institutional decision.
6. A returned proposal counts as resolved but contributes zero accepted credits.
7. Resolving all proposals enables the written-decision action but does not automatically issue it.
8. Only the explicit human action issues and timestamps the decision.
9. The route calculator remains blocked before issuance and unlocks afterward.
10. The calculation uses confirmed credits only and exposes every arithmetic assumption.
11. Current and transfer paths remain equally prominent and unranked.
12. The Diego view cannot approve equivalencies or issue institutional decisions.
13. Invalid LLM output fails safely without changing human state.
14. Simulated output is visibly and repeatedly labeled.
15. No real data, secret, forbidden proxy, recommendation score, or ranking language exists in source or rendered output.
16. The workflow remains usable at desktop and mobile widths and by keyboard.

## Automated tests

Add focused tests for:

- rationale trimming, required validation, and 240-character limit;
- transition guards and attempts to skip states;
- pending, confirmed, and returned proposal behavior;
- issue-decision blockers;
- confirmed-credit total excluding returned courses;
- calculation blocker before issuance;
- deterministic route arithmetic after issuance;
- invalid LLM response and out-of-set course IDs;
- rendered HTML containing the required safety labels;
- source-schema scan proving forbidden fields and ranking terms are absent.

Use the project's existing test runner when practical. Do not install a large testing framework for tests that pure functions and the current renderer can cover.

## Mechanical and persona testing

After the complete slice works:

1. Run the test plan from `docs/PACKET.md`.
2. Find and document at least one genuine defect; do not manufacture or intentionally insert a bug.
3. Fix the defect, rerun the checks, and record the evidence in `docs/TESTING.md`.
4. Deploy the corrected build.
5. Present the ordered product states to Diego, the Week 4 student persona defined in the packet.
6. Log every hesitation and confusion in `docs/PERSONA.md`.
7. Fix the highest-risk confusion, rerun the affected checks, and deploy the final version.

Record the test context accurately. The user explicitly directed that this persona pass occur in the build conversation because the relevant context was already present.

## Commit and deployment plan

Use small, coherent commits. Do not combine the entire project into one commit.

1. `docs: lock week 4 packet and implementation plan`
   - Packet, approved mockup, implementation prompt, and decision log.
2. `feat: add fictional transfer evidence workspace`
   - Project setup, design tokens, typed fixtures, case summary, proposal cards, and safety labels.
3. `feat: add bounded llm proposal boundary`
   - Server endpoint, strict response validation, simulated fallback, and failure state.
4. `feat: enforce evaluator decisions`
   - Rationale validation, confirm/return actions, decision history, and transition guards.
5. `feat: gate written decision and route calculation`
   - Institutional issuance, locked/unlocked calculator, equal-weight route view, and Diego preview.

**Deployment 1:** Deploy after commit 5 when the entire fictional evaluator flow works at a public URL.

6. `fix: close defect found in mechanical test`
   - Document the real defect, implement the correction, and add a regression test.

**Deployment 2:** Redeploy immediately after the mechanical fix and verify the public URL.

7. `fix: address highest-risk persona confusion`
   - Apply the persona-driven usability fix and update the persona record.

**Final deployment:** Deploy the persona-tested build, verify the URL, and preserve the deployment evidence.

At the end of every working session:

- update `DECISIONS.md`;
- state tomorrow's first move;
- run the relevant checks;
- commit the coherent change;
- push it to GitHub.

## Documentation deliverables

Maintain these files as work progresses:

- `docs/PACKET.md` - approved plan before code;
- `docs/IMPLEMENTATION_PROMPT.md` - this build contract;
- `docs/TESTING.md` - mechanical pass, defect, fix, regression evidence, and redeployment;
- `docs/PERSONA.md` - synthetic evaluator, screenshot sequence, confusion log, selected fix, and result;
- `docs/DEMO_SCRIPT.md` - three-minute walkthrough plus thirty-second reflection;
- `DECISIONS.md` - chronological decisions and tomorrow's first move;
- `README.md` - local run instructions, safety boundaries, live URL, and GitHub link.

Do not create final PDFs until their source documents are stable. When PDFs are generated, verify every rendered page for clipping, unreadable text, broken diagrams, and missing page transitions.

## Stop conditions

Stop and report the blocker instead of guessing if:

- the project is still inside an earlier week's repository;
- the packet or mockup is missing;
- a requested change would introduce real personal data;
- a secret appears in source or Git history;
- the live LLM mode would require exposing a key to the browser;
- the calculator can be reached without the written institutional decision;
- a proposed feature ranks, predicts, or chooses a route for Diego;
- deployment would overwrite an unrelated existing project without explicit approval.

Build the smallest complete slice that satisfies this contract. Do not add dashboards, chatbots, recommendation feeds, national data ingestion, document upload, payments, or other speculative features.
