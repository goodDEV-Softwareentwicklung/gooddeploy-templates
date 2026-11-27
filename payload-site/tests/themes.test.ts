// Themes: Kontraste nach WCAG AA für alle Paletten, hell und dunkel, und dass
// nur geprüfte Werte ins CSS kommen.
import assert from "node:assert/strict";
import { test } from "node:test";
import { contrastPairs, contrastRatio, meetsAA } from "../themes/colors.ts";
import { defaultTheme, registeredThemes } from "../themes/registry.ts";
import { darkColors, resolveTheme, themeCss } from "../themes/resolve.ts";

test("drei neutrale Themes, Standard ist whitelabel", () => {
  assert.deepEqual(
    registeredThemes.map((t) => t.id),
    ["whitelabel", "classic", "bold"],
  );
  assert.equal(defaultTheme, "whitelabel");
});

test("hell: jede Palette erfüllt WCAG AA für Text auf ihren Flächen", () => {
  for (const theme of registeredThemes) {
    for (const [id, palette] of Object.entries(theme.palettes)) {
      for (const [fg, bg] of contrastPairs) {
        const c = palette.colors;
        assert.ok(meetsAA(c[fg], c[bg]), `${theme.id}/${id}: ${fg} auf ${bg} = ${contrastRatio(c[fg], c[bg]).toFixed(2)}`);
      }
    }
  }
});

test("dunkel: Text, gedämpfter Text und Links (Akzentfarbe) auf den dunklen Flächen erfüllen WCAG AA", () => {
  for (const [fg, bg] of [
    ["ink", "bg"],
    ["muted", "bg"],
    ["ink", "surface"],
    ["muted", "surface"],
    ["darkInk", "dark"],
  ] as const) {
    assert.ok(meetsAA(darkColors[fg], darkColors[bg]), `${fg} auf ${bg}`);
  }
  for (const theme of registeredThemes) {
    for (const [id, palette] of Object.entries(theme.palettes)) {
      for (const bg of [darkColors.bg, darkColors.surface]) {
        assert.ok(meetsAA(palette.colors.accent, bg), `${theme.id}/${id}: Akzent auf ${bg}`);
      }
    }
  }
});

test("eigene Farben: nur Hex-Werte kommen ins CSS, unbekanntes Theme fällt auf den Standard zurück", () => {
  const css = themeCss(resolveTheme({ theme: "gibt-es-nicht", colors: { primary: "red;}</style><script>", accent: "#123456" } }));
  assert.match(css, /--accent:#123456/);
  assert.doesNotMatch(css, /script|red;/);
  assert.match(css, /^:root\{--primary:#1f5f6b;/);
  assert.match(css, /@media \(prefers-color-scheme: dark\)\{:root\{--bg:#121417;/);
});
