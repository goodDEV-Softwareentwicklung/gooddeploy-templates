// Meta-Tags aus den SEO-Feldern; mit laufender App: starter_integration_test.go.
import assert from "node:assert/strict";
import { test } from "node:test";
import { contentMetadata } from "../lib/metadata.ts";

test("SEO-Felder vor Seitentitel und Beschreibung aus „Website“, kanonische Adresse absolut", () => {
  const m = contentMetadata({
    meta: { title: "Eigener Titel", description: "" },
    title: "Kontakt",
    fallbackDescription: "Standard",
    path: "/kontakt",
    origin: "https://example.com",
  });
  assert.equal(m.title, "Eigener Titel");
  assert.equal(m.description, "Standard");
  assert.equal(m.alternates?.canonical, "https://example.com/kontakt");
  assert.equal((m.openGraph as { url?: string }).url, "https://example.com/kontakt");
  const plain = contentMetadata({ title: "Kontakt", path: "/kontakt", origin: "https://example.com/" });
  assert.equal(plain.title, "Kontakt");
  assert.equal(plain.description, undefined);
});
