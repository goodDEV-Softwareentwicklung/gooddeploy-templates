// AK-ST-14-13-5: Favicon aus Logo, sonst Icon in der Theme-Farbe, sonst
// neutrales Zeichen; kein Logo von Payload oder gooddeploy (E223, E228).
import assert from "node:assert/strict";
import { test } from "node:test";
import { faviconHref, faviconSource, iconSvg } from "../lib/favicon.ts";
import { resolveTheme } from "../themes/resolve.ts";
import { neutralIconNode } from "../ui/icon-nodes.ts";
import { iconOptions } from "../ui/icons.ts";
import { iconNodes } from "../ui/icon-nodes.ts";

test("AK-ST-14-13-5 mit Logo: Favicon ist das hochgeladene Logo", () => {
  const source = faviconSource({ logo: { url: "/api/media/file/logo.png" }, logoIcon: "star" });
  assert.deepEqual(source, { kind: "logo", url: "/api/media/file/logo.png" });
  // fremde Adressen nicht: dann das Icon
  assert.equal(faviconSource({ logo: { url: "https://fremd.example/x.png" }, logoIcon: "star" }).kind, "icon");
  assert.equal(faviconSource({ logo: { url: "//fremd.example/x.png" } }).kind, "icon");
  assert.equal(faviconSource({ logo: 3 }).kind, "icon", "nicht geladenes Logo (nur ID)");
});

test("AK-ST-14-13-5 ohne Logo: gewähltes Icon in Primärfarbe und Text auf Primär des Themes", () => {
  const settings = { logoIcon: "rocket", theme: "classic" };
  const source = faviconSource(settings);
  assert.equal(source.kind, "icon");
  if (source.kind !== "icon") return;
  const { colors } = resolveTheme(settings);
  assert.equal(source.background, colors.primary);
  assert.equal(source.foreground, colors.primaryInk);
  assert.equal(source.node, iconNodes.rocket);
  const svg = iconSvg(source, "icon");
  assert.match(svg, new RegExp(`fill="${colors.primary}"`));
  assert.match(svg, new RegExp(`stroke="${colors.primaryInk}"`));
  assert.doesNotMatch(svg, /key=/);
  assert.match(iconSvg(source, "apple"), /width="180"/);
});

test("AK-ST-14-13-5 ohne Icon: neutrales Zeichen, keine fremden Logos", () => {
  for (const logoIcon of [null, undefined, "", "payload", "gooddeploy"]) {
    const source = faviconSource({ logoIcon });
    assert.equal(source.kind === "icon" && source.node, neutralIconNode, String(logoIcon));
  }
  const svg = iconSvg(faviconSource(null) as Extract<ReturnType<typeof faviconSource>, { kind: "icon" }>, "icon");
  assert.doesNotMatch(svg.toLowerCase(), /payload|gooddeploy/);
});

test("AK-ST-14-13-5 jedes Icon der Auswahl hat ein Zeichen fürs Favicon", () => {
  for (const { value } of iconOptions) assert.ok(iconNodes[value]?.length > 0, value);
});

test("AK-ST-14-13-5 folgt Änderungen: Adresse ändert sich mit Logo, Icon und Farben", () => {
  const hrefs = new Set(
    [
      faviconSource({ logoIcon: "star" }),
      faviconSource({ logoIcon: "heart" }),
      faviconSource({ logoIcon: "star", theme: "bold" }),
      faviconSource({ logoIcon: "star", colors: { primary: "#112233" } }),
      faviconSource({ logo: { url: "/api/media/file/a.png" } }),
      faviconSource({ logo: { url: "/api/media/file/b.png" } }),
    ].map((s) => faviconHref(s)),
  );
  assert.equal(hrefs.size, 6);
  assert.equal(faviconHref(faviconSource({ logoIcon: "star" })), faviconHref(faviconSource({ logoIcon: "star" })));
  assert.match(faviconHref(faviconSource(null), "apple"), /^\/site-icon\?v=[0-9a-f]{10}&size=apple$/);
});
