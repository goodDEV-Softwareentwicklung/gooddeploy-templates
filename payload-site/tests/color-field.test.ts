// AK-ST-14-13-7: Farbwähler für die eigenen Farben (components/admin/ColorField.tsx):
// Vorgaben aus Theme und Farbvariante, Kontrasthinweis, Hex-Prüfung bleibt.
import assert from "node:assert/strict";
import { test } from "node:test";
import { SiteSettings, colorFieldComponent } from "../globals/SiteSettings.ts";
import { contrastRatio, formatContrast, toSixDigits } from "../themes/colors.ts";
import { paletteColors, resolveTheme } from "../themes/resolve.ts";

type AnyField = { name?: string; type?: string; fields?: AnyField[]; tabs?: { fields: AnyField[] }[]; admin?: { components?: { Field?: string } }; validate?: (v: unknown) => true | string };
const all = (fields: AnyField[]): AnyField[] =>
  fields.flatMap((f) => [f, ...all(f.fields ?? []), ...(f.tabs ?? []).flatMap((t) => all(t.fields))]);

test("AK-ST-14-13-7 alle eigenen Farben nutzen den Farbwähler, Hex-Prüfung bleibt", () => {
  const colors = all(SiteSettings.fields as AnyField[]).find((f) => f.name === "colors");
  assert.ok(colors);
  const fields = all(colors.fields ?? []).filter((f) => f.type === "text");
  assert.deepEqual(fields.map((f) => f.name).sort(), ["accent", "accentInk", "bg", "dark", "darkInk", "primary", "primaryInk"]);
  for (const f of fields) {
    assert.equal(f.admin?.components?.Field, colorFieldComponent, f.name);
    assert.equal(f.validate?.("#1f5f6b"), true);
    assert.equal(f.validate?.(""), true, "leer = Wert aus dem Theme");
    assert.equal(typeof f.validate?.("rot"), "string", `${f.name}: kein Hex-Wert`);
    assert.equal(typeof f.validate?.("#12345"), "string");
  }
  assert.equal(colorFieldComponent, "/components/admin/ColorField.tsx#ColorField");
});

test("AK-ST-14-13-7 Vorgabe aus Theme und Farbvariante, ohne eigene Farben", () => {
  assert.deepEqual(paletteColors("classic", null), resolveTheme({ theme: "classic" }).colors);
  assert.deepEqual(paletteColors("unbekannt", "x"), resolveTheme({}).colors);
});

test("AK-ST-14-13-7 Kontrasthinweis nie besser als gemessen, Farbauswahl braucht #rrggbb", () => {
  assert.equal(formatContrast(21), "21,0:1");
  assert.equal(formatContrast(4.4999), "4,4:1", "abgerundet: 4,49 darf nicht als 4,5 erscheinen");
  assert.equal(formatContrast(contrastRatio("#ffffff", "#000000")), "21,0:1");
  assert.equal(toSixDigits("#abc"), "#aabbcc");
  assert.equal(toSixDigits("#1F5F6B"), "#1f5f6b");
  assert.equal(toSixDigits("kaputt"), "#000000");
});
