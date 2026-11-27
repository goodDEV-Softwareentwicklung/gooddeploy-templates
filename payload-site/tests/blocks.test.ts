// Module der Seiten: welche es gibt und wo. Gegenbeispiele: kein freies HTML,
// keine Einbettungen fremder Skripte, kein Formular mit Versand.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Block, Field } from "payload";
import { columnBlocks, pageLayoutBlocks, reusableLayoutBlocks } from "../blocks/index.ts";
import { columnCount } from "../blocks/section/layouts.ts";
import { linkField } from "../fields/link.ts";

const slugs = (blocks: Block[]) => blocks.map((b) => b.slug);

test("Seite: Abschnitt, Inhaltsmodule und Verweis auf die Bibliothek", () => {
  assert.deepEqual(slugs(pageLayoutBlocks), [
    "section",
    "hero",
    "text",
    "mediaText",
    "cards",
    "accordion",
    "stats",
    "quote",
    "cta",
    "gallery",
    "team",
    "contact",
    "reusable",
  ]);
  // In Spalten kein Abschnitt und kein Hero, in der Bibliothek kein Verweis auf sich selbst.
  assert.ok(!slugs(columnBlocks).some((s) => ["section", "hero", "reusable"].includes(s)));
  assert.ok(!slugs(reusableLayoutBlocks).includes("reusable"));
});

test("Gegenbeispiel: keine Module mit eigenem Code, Einbettungen oder Formularversand", () => {
  const all = JSON.stringify(pageLayoutBlocks, (_k, v) => (typeof v === "function" ? undefined : v));
  for (const bad of ["htmlCode", "embed", "donation", "petition", "eventList", "postList", '"type":"code"', "showForm"]) {
    assert.ok(!all.includes(bad), bad);
  }
});

test("Abschnitt: Spaltenzahl aus dem Layout", () => {
  assert.equal(columnCount("oneColumn"), 1);
  assert.equal(columnCount("twoThirdsOneThird"), 2);
  assert.equal(columnCount("quarters"), 4);
  assert.equal(columnCount(undefined), 1);
});

test("Links zeigen auf Seiten oder freie Adressen", () => {
  const find = (fields: Field[], name: string): Field | undefined => {
    for (const f of fields) {
      if ("name" in f && f.name === name) return f;
      if ("fields" in f) {
        const hit = find(f.fields as Field[], name);
        if (hit) return hit;
      }
    }
  };
  const reference = find(linkField().fields, "reference") as { relationTo: string };
  assert.equal(reference.relationTo, "pages");
});
