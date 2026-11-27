import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RenderBlocks } from "../../../blocks/RenderBlocks.tsx";
import { findPage, getSiteSettings } from "../../../lib/content.ts";
import { contentMetadata } from "../../../lib/metadata.ts";
import { homeSlug, pagePath, requestOrigin } from "../../../lib/paths.ts";
import { notFoundOrRedirect } from "../not-found-or-redirect.ts";

type Props = { params: Promise<{ slug: string[] }> };

// Seiten haben eine Ebene (/ueber-uns); tiefere Pfade gibt es nur als Weiterleitung.
async function loadPage(params: Props["params"]) {
  const { slug } = await params;
  if (slug.length !== 1) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(slug[0]);
  } catch {
    return null; // kaputte Kodierung wie „%“ allein: 404 statt 500
  }
  return findPage(decoded);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await loadPage(params);
  if (!page) return {};
  const settings = await getSiteSettings();
  return contentMetadata({
    meta: page.meta,
    title: page.title,
    fallbackDescription: settings.description,
    path: pagePath(page.slug),
    origin: requestOrigin(await headers()),
  });
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  if (slug.length === 1 && slug[0] === homeSlug) redirect("/");
  const page = await loadPage(params);
  if (!page) return notFoundOrRedirect(`/${slug.join("/")}`);
  return <RenderBlocks blocks={page.layout} />;
}
