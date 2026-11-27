// Links im Fließtext (Lexical): eigene Konverter statt LinkJSXConverter von
// Payload, der `fields.url` ungeprüft ins href schreibt. Freie Ziele gehen
// durch safeLinkUrl (lib/links.ts); ein ungültiges Ziel wird Text ohne Link.
// Ohne JSX, damit tests/richtext.test.ts die Konverter mit Node laden kann.
import type { JSXConverters } from "@payloadcms/richtext-lexical/react";
import { createElement, Fragment, type ReactNode } from "react";
import { safeLinkUrl } from "../lib/links.ts";
import { pagePath } from "../lib/paths.ts";

type LinkFields = { linkType?: "custom" | "internal"; url?: string | null; newTab?: boolean | null; doc?: { value?: unknown } | null };
type LinkNode = { fields: LinkFields; children: unknown[] };
type NodesToJSX = (args: { nodes: unknown[] }) => ReactNode[];

/** Ziel eines Links im Fließtext oder `null` */
export function richTextLinkHref(fields: LinkFields): string | null {
  if (fields.linkType === "internal") {
    const value = fields.doc?.value as { slug?: string } | undefined;
    return value && typeof value === "object" ? pagePath(value.slug) : null;
  }
  return safeLinkUrl(fields.url);
}

const renderLink = ({ node, nodesToJSX }: { node: LinkNode; nodesToJSX: NodesToJSX }) => {
  const children = nodesToJSX({ nodes: node.children });
  const href = richTextLinkHref(node.fields);
  if (!href) return createElement(Fragment, null, ...children);
  const tab = node.fields.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return createElement("a", { href, ...tab }, ...children);
};

/**
 * Konverter für link und autolink. Upload- und Relationship-Knoten sind im
 * Editor abgeschaltet (fields/richText.ts); kämen sie über die API doch in
 * den Text, rendert die Website sie nicht (kein Link auf fremde Dateien).
 */
export const richTextLinkConverters = {
  link: renderLink,
  autolink: renderLink,
  upload: () => null,
  relationship: () => null,
} as unknown as JSXConverters;
