// AK-ST-14-13-6: Beispielbilder in public/samples/ (WebP, etwa 100–200 KB,
// Credits), ohne S3 nutzbar. Mit laufender App: starter_integration_test.go.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { mediaCollection, sampleImageAddress } from "../collections/Media.ts";
import { sampleImages, sampleImageUrl } from "../lib/sample-images.ts";

const dir = new URL("../public/samples/", import.meta.url);

test("AK-ST-14-13-6 vier bis sechs WebP-Bilder, je höchstens 200 KB, Maße und Größe wie in der Liste", () => {
  assert.ok(sampleImages.length >= 4 && sampleImages.length <= 6);
  const files = readdirSync(dir).filter((f) => f.endsWith(".webp")).sort();
  assert.deepEqual(files, sampleImages.map((i) => i.filename).sort());
  for (const image of sampleImages) {
    const bytes = readFileSync(new URL(image.filename, dir));
    assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", image.filename);
    assert.equal(statSync(new URL(image.filename, dir)).size, image.filesize, image.filename);
    assert.ok(image.filesize <= 200 * 1024, image.filename);
    assert.ok(image.alt.length > 10, `${image.filename}: Alternativtext`);
  }
});

test("AK-ST-14-13-6 Credits je Bild mit Fotograf, Link und Lizenz; nicht unter MIT", () => {
  const credits = readFileSync(new URL("CREDITS.md", dir), "utf8");
  for (const image of sampleImages) {
    const row = credits.split("\n").find((line) => line.includes(`\`${image.filename}\``));
    assert.ok(row, `${image.filename} fehlt in CREDITS.md`);
    assert.match(row, /https:\/\/unsplash\.com\/photos\//, `${image.filename}: Link`);
    assert.match(row, /https:\/\/unsplash\.com\/@/, `${image.filename}: Fotograf`);
    assert.match(row, /Unsplash License/, `${image.filename}: Lizenz`);
  }
  assert.match(credits, /nicht unter der MIT-Lizenz/);
});

test("AK-ST-14-13-6 Adresse in public/ nur für markierte Beispielbilder, sonst bleibt die von Payload", () => {
  assert.equal(sampleImageUrl({ sample: true, filename: "workspace.webp" }), "/samples/workspace.webp");
  assert.equal(sampleImageUrl({ sample: false, filename: "workspace.webp" }), undefined, "eigener Upload gleichen Namens");
  assert.equal(sampleImageUrl({ sample: true, filename: "../../etc/passwd" }), undefined);
  type Hook = (a: { doc: Record<string, unknown> }) => Record<string, unknown>;
  const hook = sampleImageAddress as unknown as Hook;
  assert.deepEqual(hook({ doc: { sample: true, filename: "workspace.webp", url: "/api/media/file/workspace.webp" } }), {
    sample: true,
    filename: "workspace.webp",
    url: "/samples/workspace.webp",
    thumbnailURL: "/samples/workspace.webp",
  });
  const own = { sample: false, filename: "workspace.webp", url: "/api/media/file/workspace.webp" };
  assert.deepEqual(hook({ doc: own }), own);
});

test("AK-ST-14-13-6 Markierung „Beispielbild“ setzt nur die Vorlage, nie die API; mit und ohne S3", () => {
  for (const enabled of [true, false]) {
    const c = mediaCollection(enabled);
    const field = c.fields.find((f) => "name" in f && f.name === "sample") as { access?: Record<string, () => boolean>; admin?: { hidden?: boolean } };
    assert.ok(field);
    assert.equal(field.access?.create?.(), false);
    assert.equal(field.access?.update?.(), false);
    assert.equal(field.admin?.hidden, true);
    assert.ok(c.hooks?.afterRead?.includes(sampleImageAddress));
  }
});
