// Links im Fließtext: gleiche Regeln wie freie Link-Ziele (lib/links.ts).
// Gerendert mit dem RichText von Payload und den Konvertern der Vorlage.
import assert from "node:assert/strict";
import { test } from "node:test";
import { type JSXConvertersFunction, RichText } from "@payloadcms/richtext-lexical/react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { richTextLinkConverters } from "../blocks/richTextLinks.ts";
import { withSafeLinkUrl } from "../fields/richText.ts";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({ ...defaultConverters, ...richTextLinkConverters });

const base = { version: 1, direction: "ltr", format: "", indent: 0 };
const text = (value: string) => ({ type: "text", version: 1, text: value, format: 0, detail: 0, mode: "normal", style: "" });
const render = (...children: object[]) =>
  renderToStaticMarkup(
    createElement(RichText, {
      converters,
      data: { root: { ...base, type: "root", children: [{ ...base, type: "paragraph", textFormat: 0, textStyle: "", children }] } },
    } as never),
  );
const link = (type: "link" | "autolink", fields: object) => ({ ...base, type, version: 3, fields, children: [text("Ziel")] });

test("gültige Links: freie Adresse, mailto, interne Seite, neuer Tab mit rel", () => {
  assert.match(render(link("link", { linkType: "custom", url: "https://example.com/a" })), /<a href="https:\/\/example\.com\/a">Ziel<\/a>/);
  assert.match(render(link("autolink", { url: "mailto:hallo@example.com" })), /<a href="mailto:hallo@example\.com">Ziel<\/a>/);
  assert.match(
    render(link("link", { linkType: "internal", doc: { relationTo: "pages", value: { slug: "kontakt" } } })),
    /<a href="\/kontakt">/,
  );
  assert.match(render(link("link", { linkType: "custom", url: "/preise", newTab: true })), /target="_blank" rel="noopener noreferrer"/);
});

test("Gegenbeispiele: data:, vbscript:, javascript: und //host werden Text ohne Link", () => {
  for (const url of [
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "javascript:alert(1)",
    "//evil.example",
    " JavaScript:alert(1)",
  ]) {
    for (const type of ["link", "autolink"] as const) {
      const html = render(link(type, { linkType: "custom", url }));
      assert.ok(!html.includes("<a"), `${type} ${url}: ${html}`);
      assert.match(html, /<p>Ziel<\/p>/, `${type} ${url}`);
    }
  }
});

test("Upload- und Relationship-Knoten rendern nichts (im Editor abgeschaltet)", () => {
  const upload = {
    ...base,
    type: "upload",
    relationTo: "media",
    value: { url: "https://evil.example/x.html", mimeType: "text/html", filename: "x.html" },
    fields: {},
  };
  assert.equal(render(upload, text("Rest")), '<div class="payload-richtext"><p>Rest</p></div>');
  assert.equal(render({ ...base, type: "relationship", relationTo: "pages", value: { slug: "x" } }, text("Rest")).includes("<a"), false);
});

test("Editor: Feld url des Link-Features prüft freie Adressen, interne Links nicht", () => {
  const [url] = withSafeLinkUrl([{ name: "url", type: "text", validate: () => true }]) as unknown as {
    validate: (v: unknown, o: unknown) => unknown;
  }[];
  const custom = { siblingData: { linkType: "custom" } };
  assert.equal(typeof url.validate("javascript:alert(1)", custom), "string");
  assert.equal(typeof url.validate("data:text/html,x", custom), "string");
  assert.equal(typeof url.validate("//evil.example", custom), "string");
  assert.equal(url.validate("https://example.com", custom), true);
  assert.equal(url.validate(undefined, { siblingData: { linkType: "internal" } }), true);
  // Die Prüfung von Payload bleibt davor.
  const [strict] = withSafeLinkUrl([{ name: "url", type: "text", validate: () => "Invalid URL" }]) as unknown as {
    validate: (v: unknown, o: unknown) => unknown;
  }[];
  assert.equal(strict.validate("https://example.com", custom), "Invalid URL");
});
