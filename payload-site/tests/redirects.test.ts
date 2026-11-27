// Weiterleitungen: Pfade vereinheitlichen, Ziel bestimmen, unsichere Ziele
// ablehnen. Mit laufender App: starter_integration_test.go (/team → /ueber-uns).
import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeRedirectPath, redirectTarget, safeRedirectUrl, validateRedirectUrl } from "../lib/redirects.ts";

test("Quellpfade einheitlich: führender Slash, ohne Herkunft, Abfrage und Slash am Ende", () => {
  for (const [input, want] of [
    ["alt/", "/alt"],
    ["https://example.com/alt/?x=1#a", "/alt"],
    ["//doppelt//pfad/", "/doppelt/pfad"],
    ["/%C3%BCber", "/über"],
    ["/", "/"],
  ] as const) {
    assert.equal(normalizeRedirectPath(input), want, input);
  }
  assert.equal(normalizeRedirectPath(""), null);
  assert.equal(normalizeRedirectPath("/%"), null);
});

test("Ziel: Seite oder sichere Adresse, dauerhaft oder vorübergehend", () => {
  assert.deepEqual(
    redirectTarget({
      from: "/team",
      type: "301",
      to: { type: "reference", reference: { relationTo: "pages", value: { slug: "ueber-uns" } } },
    }),
    {
      href: "/ueber-uns",
      permanent: true,
    },
  );
  assert.deepEqual(redirectTarget({ from: "/aktion", type: "302", to: { type: "custom", url: "https://example.com/x" } }), {
    href: "https://example.com/x",
    permanent: false,
  });
  assert.deepEqual(
    redirectTarget({ from: "/start", to: { type: "reference", reference: { relationTo: "pages", value: { slug: "home" } } } })?.href,
    "/",
  );
});

test("Gegenbeispiele: keine offenen Weiterleitungen, keine Schleife auf sich selbst", () => {
  for (const bad of ["javascript:alert(1)", "//evil.example", "/\\evil.example", "/..//evil.example", "ftp://x.example"]) {
    assert.equal(safeRedirectUrl(bad), null, bad);
    assert.equal(typeof validateRedirectUrl(bad), "string", bad);
  }
  assert.equal(redirectTarget({ from: "/a", to: { type: "custom", url: "/a/" } }), null);
  assert.equal(
    redirectTarget({ from: "/a", to: { type: "reference", reference: { relationTo: "pages", value: 7 } } }),
    null,
    "Seite nicht geladen",
  );
});
