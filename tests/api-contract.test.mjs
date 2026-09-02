import assert from "node:assert/strict";
import test from "node:test";
import handler from "../api/propose.ts";

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
    },
  };
}

test("proposal endpoint returns the contract consumed by the interface", async () => {
  const response = createResponse();
  await handler(
    { method: "POST", body: { proposalIds: ["EQ-101", "EQ-301"] } },
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.mode, "simulated");
  assert.deepEqual(
    Object.keys(response.payload.proposals[0]).sort(),
    ["explanation", "missingEvidence", "proposalId"],
  );
  assert.equal(response.payload.proposals[0].proposalId, "EQ-101");
});

test("proposal endpoint rejects records outside the allowlist", async () => {
  const response = createResponse();
  await handler(
    { method: "POST", body: { proposalIds: ["UNKNOWN"] } },
    response,
  );

  assert.equal(response.statusCode, 400);
});
