// Beispielinhalte nur beim allerersten Start: ohne Konto und ohne Seite.
// Mit echter Datenbank: starter_integration_test.go.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Payload } from "payload";
import { shouldSeed } from "../lib/seed.ts";

const fake = (users: number, pages: number) =>
  ({
    count: async ({ collection }: { collection: string }) => ({ totalDocs: collection === "users" ? users : pages }),
  }) as unknown as Payload;

test("Beispielinhalte nur ohne Konto und ohne Seite", async () => {
  assert.equal(await shouldSeed(fake(0, 0)), true);
  assert.equal(await shouldSeed(fake(1, 0)), false, "mit Konto: gelöschte Beispiele kommen nie zurück");
  assert.equal(await shouldSeed(fake(0, 3)), false, "schon Seiten da (zweite Instanz, Neustart)");
});
