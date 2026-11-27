import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RenderBlocks } from "../../../blocks/RenderBlocks.tsx";
import { findPage, getSiteSettings } from "../../../lib/content.ts";
import { contentMetadata } from "../../../lib/metadata.ts";
import { homeSlug, pagePath, requestOrigin } from "../../../lib/paths.ts";
import { previewPath, wantsPreview } from "../../../lib/preview.ts";
import { LivePreviewRefresh } from "../live-preview.tsx";
import { notFoundOrRedirect } from "../not-found-or-redirect.ts";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Seiten haben eine Ebene (/ueber-uns); tiefere Pfade gibt es nur als Weiterleitung.
async function loadPage(params: Props["params"], preview = false) {
  const { slug } = await params;
  if (slug.length !== 1) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(slug[0]);
  } catch {
    return null; // kaputte Kodierung wie „%“ allein: 404 statt 500
  }
  return findPage(decoded, preview);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const page = await loadPage(params, wantsPreview(await searchParams));
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

export default async function CmsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const preview = wantsPreview(await searchParams);
  if (slug.length === 1 && slug[0] === homeSlug) redirect(preview ? previewPath(homeSlug) : "/");
  const page = await loadPage(params, preview);
  if (!page) return notFoundOrRedirect(`/${slug.join("/")}`);
  return (
    <>
      {preview && <LivePreviewRefresh />}
      <RenderBlocks blocks={page.layout} />
    </>
  );
}
