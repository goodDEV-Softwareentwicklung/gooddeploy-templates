// AK-ST-14-14-7: Kopf und Anmeldeseite des Admin-Panels zeigen statt des
// Payload-Logos das Logo bzw. Icon der Website, mit neutralem Rückfall.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { adminBrand, fallbackName } from "../lib/admin-graphics.ts";
import { faviconHref, faviconSource } from "../lib/favicon.ts";

const source = (name: string) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("AK-ST-14-14-7 Logo der Website, wenn eins hochgeladen ist", () => {
  const brand = adminBrand({ siteName: "Musterfirma GmbH", shortName: "Musterfirma", logo: { url: "/api/media/file/logo.png" } });
  assert.equal(brand.logoUrl, "/api/media/file/logo.png");
  assert.equal(brand.name, "Musterfirma");
});

test("AK-ST-14-14-7 ohne Logo das gewählte Icon in der Theme-Farbe (wie das Favicon)", () => {
  const settings = { siteName: "Musterfirma GmbH", logoIcon: "leaf", theme: "classic" };
  const brand = adminBrand(settings);
  assert.equal(brand.logoUrl, undefined);
  assert.equal(brand.name, "Musterfirma GmbH");
  assert.equal(brand.iconUrl, faviconHref(faviconSource(settings)));
  assert.ok(brand.iconUrl.startsWith("/site-icon?v="));
});

test("AK-ST-14-14-7 neutraler Rückfall ohne Einstellungen, fremde Logo-Adressen nicht", () => {
  for (const settings of [null, undefined, {}]) {
    const brand = adminBrand(settings);
    assert.equal(brand.name, fallbackName);
    assert.equal(brand.logoUrl, undefined);
    assert.equal(brand.iconUrl, faviconHref(faviconSource(null)));
  }
  assert.equal(adminBrand({ logo: { url: "https://fremd.example/logo.png" } }).logoUrl, undefined);
});

test("AK-ST-14-14-7 eingebunden als admin.components.graphics (Logo und Icon), kein Payload-Logo", () => {
  const config = source("payload.config.ts");
  assert.match(
    config,
    /graphics: \{ Logo: "\/components\/admin\/AdminGraphics\.tsx#AdminLogo", Icon: "\/components\/admin\/AdminGraphics\.tsx#AdminIcon" \}/,
  );
  const importMap = source("app/(payload)/admin/importMap.js");
  assert.ok(
    importMap.includes('"/components/admin/AdminGraphics.tsx#AdminLogo"') && importMap.includes('"/components/admin/AdminGraphics.tsx#AdminIcon"'),
  );
  const component = source("components/admin/AdminGraphics.tsx");
  assert.match(component, /catch \{\s*return adminBrand\(null\);/, "ohne Datenbank neutral statt Fehler");
  assert.ok(!/PayloadLogo|PayloadIcon|gooddeploy/i.test(component));
});
