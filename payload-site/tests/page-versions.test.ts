// AK-ST-14-13-1: Seiten aus der Zeit vor den Entwürfen bekommen genau einmal
// eine veröffentlichte Version (Admin-Panel und Vorschau lesen daraus). Mit
// echter Datenbank: TestStarterDrafts (starter_integration_test.go).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Payload } from "payload";
import { backfillPageVersions, pagesWithoutVersion, restorePageStamp, restoreVersionStamp } from "../lib/page-versions.ts";

const fake = (versions: Record<number, number>) =>
  ({
    find: async () => ({ docs: Object.keys(versions).map((id) => ({ id: Number(id), updatedAt: `2026-11-0${id}T00:00:00.000Z` })) }),
    countVersions: async ({ where }: { where: { parent: { equals: number } } }) => ({ totalDocs: versions[where.parent.equals] }),
  }) as unknown as Payload;

test("AK-ST-14-13-1 nur Seiten ohne Version, mit altem Zeitpunkt „Zuletzt geändert“", async () => {
  assert.deepEqual(await pagesWithoutVersion(fake({ 1: 0, 2: 3, 3: 0 })), [
    { id: 1, updatedAt: "2026-11-01T00:00:00.000Z" },
    { id: 3, updatedAt: "2026-11-03T00:00:00.000Z" },
  ]);
  assert.deepEqual(await pagesWithoutVersion(fake({ 1: 1, 2: 1 })), [], "zweiter Start: nichts zu tun");
});

// AK-ST-14-14-8 (Nachträge aus dem Review von ST-14-13): jede Seite einzeln,
// Fehler je Seite mit ID im Log; der alte Zeitpunkt nur für die eben angelegte Version.
test("AK-ST-14-14-8 jede Seite einzeln: eine gescheiterte Seite hält die anderen nicht auf, ihre ID steht im Log", async () => {
  const queries: [string, unknown[]][] = [];
  const updated: number[] = [];
  const payload = {
    ...fake({ 1: 0, 2: 0, 3: 0 }),
    update: async ({ id }: { id: number }) => {
      if (id === 2) throw new Error("Feld Titel fehlt");
      updated.push(id);
    },
    db: { pool: { query: async (sql: string, params: unknown[]) => void queries.push([sql, params]) } },
  } as unknown as Payload;
  const log: string[] = [];
  assert.equal(await backfillPageVersions(payload, (line) => log.push(line)), 2);
  assert.deepEqual(updated, [1, 3]);
  assert.equal(log.length, 1);
  assert.match(log[0], /Seite 2 .*Feld Titel fehlt/);
  assert.deepEqual(
    queries.map(([, params]) => params[0]),
    [1, 1, 3, 3],
    "Zeitpunkte nur für Seiten mit neuer Version",
  );
});

test("AK-ST-14-14-8 Zurücksetzen von updated_at trifft nur die eben angelegte Version (latest)", () => {
  assert.match(restoreVersionStamp, /^UPDATE _pages_v SET .* WHERE parent_id = \$1 AND latest$/);
  assert.match(restorePageStamp, /^UPDATE pages SET updated_at = \$2 WHERE id = \$1$/);
});
