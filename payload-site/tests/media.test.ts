// Gegenbeispiel zu E223 (2): Ohne S3 nimmt die Sammlung „media“ keine Datei
// an und schreibt nie auf die Platte. Die Prüfung mit laufender App und
// echtem Upload steht in starter_integration_test.go.
import assert from "node:assert/strict";
import { test } from "node:test";
import { imageMimeTypes, maxUploadBytes, mediaCollection, uploadsOffMessage } from "../collections/Media.ts";

type Hook = (args: { operation: string; req: { file?: unknown } }) => unknown;

function upload(enabled: boolean) {
  const c = mediaCollection(enabled);
  assert.equal(typeof c.upload, "object");
  return { c, upload: c.upload as Record<string, unknown>, hook: c.hooks!.beforeOperation![0] as unknown as Hook };
}

const create = (c: ReturnType<typeof mediaCollection>, user?: object) =>
  (c.access!.create as (a: { req: { user?: object } }) => boolean)({ req: { user } });

test("nie ins Dateisystem: disableLocalStorage mit und ohne S3", () => {
  for (const enabled of [true, false]) {
    const { upload: u } = upload(enabled);
    assert.equal(u.disableLocalStorage, true);
    assert.equal(u.staticDir, undefined);
  }
});

test("ohne S3: kein Anlegen, Datei beim Anlegen und Ersetzen abgelehnt, Admin-Panel sagt es", () => {
  const { c, hook } = upload(false);
  assert.equal(create(c, { id: 1 }), false);
  for (const operation of ["create", "update"]) {
    assert.throws(() => hook({ operation, req: { file: { name: "a.png" } } }), (err: Error) => err.message === uploadsOffMessage);
  }
  // Alternativtext ändern ohne neue Datei bleibt möglich.
  assert.doesNotThrow(() => hook({ operation: "update", req: {} }));
  assert.match(String(c.admin?.description), /Hochladen ist aus.*S3_BUCKET/);
});

test("mit S3: Anlegen mit Konto, ohne Konto nicht", () => {
  const { c, hook } = upload(true);
  assert.equal(create(c, { id: 1 }), true);
  assert.equal(create(c), false);
  assert.doesNotThrow(() => hook({ operation: "create", req: { file: { name: "a.png" } } }));
  assert.equal(c.admin?.description, undefined);
});

test("nur Bildtypen ohne SVG, Größe begrenzt", () => {
  const { upload: u } = upload(true);
  assert.deepEqual(u.mimeTypes, ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
  assert.equal(imageMimeTypes.some((t) => t.includes("svg") || t.endsWith("*")), false);
  assert.equal(maxUploadBytes, 10 * 1024 * 1024);
});
