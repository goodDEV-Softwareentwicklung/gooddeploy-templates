// Freie Link-Ziele: nur http(s), mailto, tel, relative Pfade und Sprungmarken.
import assert from "node:assert/strict";
import { test } from "node:test";
import { linkHref } from "../blocks/mappers.ts";
import { safeLinkUrl, validateLinkUrl } from "../lib/links.ts";

test("erlaubte Ziele bleiben unverändert", () => {
  for (const ok of [
    "https://example.com/a?b=1#c",
    "http://example.com",
    "mailto:hallo@example.com",
    "tel:+491234567",
    "/kontakt#formular",
    "#formular",
    "preise",
  ]) {
    assert.equal(safeLinkUrl(ok), ok, ok);
    assert.equal(validateLinkUrl(ok), true, ok);
  }
});

test("Gegenbeispiele: Skript-Adressen und Umwege beim Speichern abgelehnt, beim Rendern verworfen", () => {
  for (const bad of [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "//evil.example",
    "/\\evil.example",
    "https://",
  ]) {
    assert.equal(safeLinkUrl(bad), null, bad);
    assert.equal(typeof validateLinkUrl(bad), "string", bad);
    assert.equal(linkHref({ type: "custom", url: bad }), undefined, bad);
  }
  assert.equal(linkHref({ type: "custom", url: "mailto:hallo@example.com" }), "mailto:hallo@example.com");
  assert.equal(validateLinkUrl(""), true, "leer prüft das Pflichtfeld, nicht diese Regel");
});
