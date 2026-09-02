import assert from "node:assert/strict";
import test from "node:test";
import { proposals } from "../src/data.ts";
import {
  MAX_RATIONALE_LENGTH,
  allProposalsResolved,
  calculateRoute,
  canIssueDecision,
  confirmedCreditTotal,
  routeCalculationBlockers,
  validateRationale,
} from "../src/logic.ts";

const review = (status, rationale = "Evidencia cotejada por la evaluadora.") => ({
  status,
  rationale,
  evaluatorName: "Laura M.",
  decidedAt: "02 sep 2026 · 16:40",
});

test("rationale is required and bounded", () => {
  assert.match(validateRationale("   "), /razón institucional/i);
  assert.equal(validateRationale("Evidencia cotejada."), null);
  assert.match(validateRationale("x".repeat(MAX_RATIONALE_LENGTH + 1)), /240/);
});

test("all proposals must be resolved before issuance", () => {
  const partial = { "EQ-101": review("confirmed") };
  assert.equal(allProposalsResolved(proposals, partial), false);
  assert.equal(canIssueDecision(proposals, partial), false);

  const complete = {
    "EQ-101": review("confirmed"),
    "EQ-204": review("confirmed"),
    "EQ-301": review("returned"),
  };
  assert.equal(allProposalsResolved(proposals, complete), true);
  assert.equal(canIssueDecision(proposals, complete), true);
});

test("returned proposals never contribute accepted credits", () => {
  const reviews = {
    "EQ-101": review("confirmed"),
    "EQ-204": review("confirmed"),
    "EQ-301": review("returned"),
  };
  assert.equal(confirmedCreditTotal(proposals, reviews, 78), 90);
});

test("calculation stays locked until a written decision exists", () => {
  assert.deepEqual(routeCalculationBlockers(null), ["Falta la decisión institucional escrita"]);
  assert.deepEqual(routeCalculationBlockers("02 sep 2026 · 16:45"), []);
});

test("route arithmetic is deterministic and bounded", () => {
  assert.deepEqual(calculateRoute({ acceptedCredits: 90, degreeCredits: 240, creditsPerSemester: 30, tuitionPerSemester: 38500 }), {
    acceptedCredits: 90,
    remainingCredits: 150,
    estimatedSemesters: 5,
    projectedTuition: 192500,
  });
  assert.equal(calculateRoute({ acceptedCredits: 999, degreeCredits: 240, creditsPerSemester: 30, tuitionPerSemester: 38500 }).remainingCredits, 0);
});
