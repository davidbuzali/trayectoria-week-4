import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("structured records preserve provenance and exclude prohibited decision fields", async () => {
  const source = await readFile(new URL("../src/data.ts", import.meta.url), "utf8");
  for (const required of ["sourceDocument", "evidenceDate", "contentEvidence", "missingEvidence"]) {
    assert.match(source, new RegExp(required));
  }
  for (const prohibited of ["approvalProbability", "employabilityScore", "destinyScore", "neighborhoodProxy", "contactGraph"]) {
    assert.doesNotMatch(source, new RegExp(prohibited, "i"));
  }
});

test("interface contains visible safety boundaries", async () => {
  const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(source, /PROPUESTA DE IA SIMULADA/);
  assert.match(source, /No mide potencial/);
  assert.match(source, /No se puede omitir la revisión humana/);
  assert.match(source, /Sin ranking/);
});
