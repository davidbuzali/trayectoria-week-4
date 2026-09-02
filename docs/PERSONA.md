# Persona test - Diego

## Correction to the test plan

The initial packet incorrectly named evaluator Laura as the persona. The user clarified that the Week 4 build persona is Diego. The Laura run was stopped, its uncommitted implementation idea was discarded, and no Laura-derived change entered the repository.

The user also explicitly requested that the test remain in the build conversation because the necessary context was already present. This document records that deviation rather than claiming a fresh-chat test.

## Persona

Diego is 20, a first-generation Industrial Engineering student whose family is stretching its finances to pay tuition. He wants a recognized degree without destabilizing his household. Reversibility, future options, and reliable evidence matter more than speed. His fictional payment deadline is September 18, 2026.

## Task sequence observed

1. Open Diego's view before the institution completes verification.
2. Explain why no route or proposed credit appears yet.
3. Open Diego's view after two proposals are confirmed, one is returned, and the institutional decision is issued.
4. Compare remaining credits, semesters, tuition, and the family affordability reference across both routes.
5. Inspect the calculation assumptions.
6. Explain the 90 recognized transfer credits and identify what to do before the deadline.

## Persona narration summary

### Before verification

> I understand that the comparison is waiting for the institution and that proposed AI matches are not being treated as facts. I do not see a route yet, which feels safer than seeing a guess. I still need to remember my payment deadline and know what evidence is holding the process up.

### After verification

> I can compare staying and transferring without being told which one is best. Both take an estimated five semesters under the current assumptions. Staying exceeds the family reference by MXN 6,000 per semester; transferring is within it. I can see that manufacturing was returned and why. I can also reject both routes.

### Point of failure

> I do not know where the 90 transfer credits came from. I can see one returned six-credit course and two confirmed courses, but the screen never explains the starting credit base. If I cannot reproduce the number, I do not know what to question or appeal before paying.

## Confusion log

| Observation | Risk | Disposition |
| --- | --- | --- |
| The blocked state is honest but gives no detailed follow-up owner or evidence-request action. | Medium | Retain as the next pilot workflow requirement. |
| “90 credits recognized” lacks visible arithmetic and hides the 78-credit confirmed base. | High | Fixed in this slice. |
| The payment deadline disappears from Diego's original result header. | Medium | Fixed alongside the high-risk issue. |
| Cost assumptions are available but collapsed below the primary comparison. | Low | Retained; the disclosure is clearly labeled and accessible. |
| Both routes estimate five semesters despite different remaining-credit totals. | Low | Mathematically correct because both totals round up at 30 credits per semester. |

## Chosen fix

The student result now includes a visible “Trazabilidad de créditos” block that shows:

- 78 credits already confirmed;
- 12 credits from two courses confirmed in this review;
- zero credits from one returned proposal;
- 90 total recognized credits.

The block also states that no AI proposal was added automatically. Diego's September 18 payment deadline is restored to the student header.

## Acceptance result

The correction passes the existing build and nine-test suite. The final Vercel deployment was exercised through the complete evaluator flow and Diego's resulting view. The production accessibility tree showed the payment deadline and the full `78 + 12 + 0 = 90` credit breakdown. The product continues to avoid ranking, prediction, automatic approval, and removal of unaffordable routes.

Stable production URL: <https://week-4-trajectory-verification.vercel.app>
