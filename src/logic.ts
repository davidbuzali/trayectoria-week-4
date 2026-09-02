import type { CourseProposal, ProposalReview } from "./data";

export const MAX_RATIONALE_LENGTH = 240;

export type ReviewMap = Readonly<Record<string, ProposalReview | undefined>>;

export function validateRationale(value: string): string | null {
  const clean = value.trim();
  if (!clean) return "Escribe una razón institucional antes de continuar.";
  if (clean.length > MAX_RATIONALE_LENGTH) {
    return `La razón no puede exceder ${MAX_RATIONALE_LENGTH} caracteres.`;
  }
  return null;
}

export function allProposalsResolved(
  proposals: readonly CourseProposal[],
  reviews: ReviewMap,
): boolean {
  return proposals.every((proposal) => Boolean(reviews[proposal.id]));
}

export function institutionalDecisionBlockers(
  proposals: readonly CourseProposal[],
  reviews: ReviewMap,
): string[] {
  const blockers: string[] = [];
  const pending = proposals.filter((proposal) => !reviews[proposal.id]);
  if (pending.length) blockers.push(`${pending.length} propuesta${pending.length === 1 ? "" : "s"} sin resolver`);

  const invalid = Object.values(reviews).filter(
    (review) => review && validateRationale(review.rationale),
  );
  if (invalid.length) blockers.push("Hay decisiones sin una razón válida");
  return blockers;
}

export function canIssueDecision(
  proposals: readonly CourseProposal[],
  reviews: ReviewMap,
): boolean {
  return institutionalDecisionBlockers(proposals, reviews).length === 0;
}

export function confirmedCreditTotal(
  proposals: readonly CourseProposal[],
  reviews: ReviewMap,
  previouslyConfirmedCredits = 0,
): number {
  return proposals.reduce((total, proposal) => {
    return reviews[proposal.id]?.status === "confirmed"
      ? total + proposal.sourceCourse.credits
      : total;
  }, previouslyConfirmedCredits);
}

export function routeCalculationBlockers(decisionIssuedAt: string | null): string[] {
  return decisionIssuedAt ? [] : ["Falta la decisión institucional escrita"];
}

export type RouteAssumptions = {
  acceptedCredits: number;
  degreeCredits: number;
  creditsPerSemester: number;
  tuitionPerSemester: number;
};

export function calculateRoute(assumptions: RouteAssumptions) {
  const { acceptedCredits, degreeCredits, creditsPerSemester, tuitionPerSemester } = assumptions;
  if ([acceptedCredits, degreeCredits, creditsPerSemester, tuitionPerSemester].some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Las suposiciones deben ser números no negativos.");
  }
  if (creditsPerSemester === 0) throw new Error("Los créditos por semestre deben ser mayores que cero.");

  const boundedAcceptedCredits = Math.min(acceptedCredits, degreeCredits);
  const remainingCredits = degreeCredits - boundedAcceptedCredits;
  const estimatedSemesters = Math.ceil(remainingCredits / creditsPerSemester);
  return {
    acceptedCredits: boundedAcceptedCredits,
    remainingCredits,
    estimatedSemesters,
    projectedTuition: estimatedSemesters * tuitionPerSemester,
  };
}
