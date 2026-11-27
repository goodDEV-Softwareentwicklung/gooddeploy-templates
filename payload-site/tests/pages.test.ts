import assert from "node:assert/strict";
import { test } from "node:test";
import { homeSlug, validSlug } from "../collections/Pages.ts";

test("Adressen der Seiten: klein, Ziffern, Bindestriche", () => {
  assert.equal(homeSlug, "home");
  for (const ok of ["home", "ueber-uns", "team-2026"]) assert.equal(validSlug(ok), true, ok);
  for (const bad of ["", "Über", "a b", "-a", "a-", "a--b", "a/b", "../x", 3]) assert.equal(typeof validSlug(bad), "string", String(bad));
});
