// AK-ST-14-13-1 bis 3: Entwürfe und Live-Vorschau der Seiten. Mit laufender
// App (Website und API ohne Anmeldung, Vorschau mit Anmeldung):
// starter_integration_test.go.
import assert from "node:assert/strict";
import { test } from "node:test";
import { autosaveInterval, Pages, readPublishedOrLoggedIn } from "../collections/Pages.ts";
import { livePreviewUrl, previewBreakpoints, previewParam, previewPath, wantsPreview } from "../lib/preview.ts";

type ReadArgs = Parameters<typeof readPublishedOrLoggedIn>[0];
const read = (user?: object) => readPublishedOrLoggedIn({ req: { user } } as unknown as ReadArgs);

test("AK-ST-14-13-1 Seiten mit Entwürfen: Speichern legt einen Entwurf an, Knopf „Entwurf speichern“ bleibt", () => {
  const versions = Pages.versions;
  assert.ok(versions && typeof versions === "object");
  const drafts = versions.drafts;
  assert.ok(drafts && typeof drafts === "object", "drafts an");
  assert.ok(drafts.autosave && typeof drafts.autosave === "object", "speichert beim Tippen als Entwurf (Live-Vorschau)");
  assert.equal(drafts.autosave.showSaveDraftButton, true);
  assert.equal(drafts.autosave.interval, autosaveInterval);
  assert.ok(autosaveInterval >= 300 && autosaveInterval <= 2000);
});

test("AK-ST-14-13-1 Gegenprobe: ohne Anmeldung nur veröffentlichte Seiten, angemeldet auch Entwürfe", () => {
  assert.deepEqual(read(), { _status: { equals: "published" } });
  assert.equal(read({ id: 1 }), true);
  assert.equal(Pages.access?.read, readPublishedOrLoggedIn);
});

test("AK-ST-14-13-2 Live-Vorschau: absolute Adresse der Seite mit ?preview=1, ohne Adresse keine Vorschau", () => {
  const headers = new Headers({ host: "kunde.example", "x-forwarded-proto": "https" });
  assert.equal(livePreviewUrl({ data: { slug: "ueber-uns" }, req: { headers } }), "https://kunde.example/ueber-uns?preview=1");
  assert.equal(livePreviewUrl({ data: { slug: "home" }, req: { headers } }), "https://kunde.example/?preview=1");
  assert.equal(livePreviewUrl({ data: { slug: "" }, req: { headers } }), null);
  assert.equal(livePreviewUrl({ data: {}, req: { headers } }), null);
  assert.equal(previewPath("kontakt"), `/kontakt?${previewParam}=1`);
});

test("AK-ST-14-13-2 Vorschau nur mit ?preview=1 (die Seite prüft zusätzlich die Anmeldung)", () => {
  assert.equal(wantsPreview({ preview: "1" }), true);
  for (const params of [undefined, {}, { preview: "0" }, { preview: ["1", "1"] }, { draft: "1" }]) {
    assert.equal(wantsPreview(params), false, JSON.stringify(params));
  }
});

test("AK-ST-14-13-2 Größen Desktop, Tablet und Mobil", () => {
  assert.deepEqual(
    previewBreakpoints.map((b) => b.label),
    ["Desktop", "Tablet", "Mobil"],
  );
  for (const b of previewBreakpoints) assert.ok(b.width > 0 && b.height > 0);
});
