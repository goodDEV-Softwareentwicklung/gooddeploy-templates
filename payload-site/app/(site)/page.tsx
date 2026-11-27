import type { Metadata } from "next";
import { headers } from "next/headers";
import { RenderBlocks } from "../../blocks/RenderBlocks.tsx";
import { findPage, getSiteSettings } from "../../lib/content.ts";
import { contentMetadata } from "../../lib/metadata.ts";
import { homeSlug, requestOrigin } from "../../lib/paths.ts";
import { wantsPreview } from "../../lib/preview.ts";
import { LivePreviewRefresh } from "./live-preview.tsx";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = await findPage(homeSlug, wantsPreview(await searchParams));
  if (!page) return {};
  const settings = await getSiteSettings();
  const meta = contentMetadata({
    meta: page.meta,
    title: page.title,
    fallbackDescription: settings.description,
    path: "/",
    origin: requestOrigin(await headers()),
  });
  // Startseite ohne „· Name“ hinter dem Titel; ohne eigenen SEO-Titel steht der Name der Website im Titel.
  const title = page.meta?.title?.trim() || settings.siteName || page.title;
  return { ...meta, title: { absolute: title } };
}

export default async function Home({ searchParams }: Props) {
  const preview = wantsPreview(await searchParams);
  const page = await findPage(homeSlug, preview);
  if (!page) {
    return (
      <section className="container empty-state">
        <h1>Noch keine Startseite</h1>
        <p>
          Leg im Admin-Panel unter <code>/admin</code> eine Seite mit der Adresse <code>{homeSlug}</code> an.
        </p>
      </section>
    );
  }
  return (
    <>
      {preview && <LivePreviewRefresh />}
      <RenderBlocks blocks={page.layout} />
    </>
  );
}
