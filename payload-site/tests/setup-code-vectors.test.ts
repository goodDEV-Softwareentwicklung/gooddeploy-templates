// Einrichtungscode gegen die gemeinsamen Testvektoren: Dieselbe Datei prüft
// gooddeploy init (Go), das den Code nach dem Anlegen anzeigt. So laufen
// beide Rechenwege nie auseinander.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { setupCode } from "../lib/setup-code.ts";

const { vectors } = JSON.parse(readFileSync(new URL("./setup-code-vectors.json", import.meta.url), "utf8")) as {
  vectors: { secret: string; code: string }[];
};

test("Einrichtungscode wie in setup-code-vectors.json (gleiche Vektoren wie gooddeploy init)", () => {
  assert.ok(vectors.length >= 3);
  for (const v of vectors) {
    assert.equal(setupCode(v.secret), v.code, v.secret);
  }
});
