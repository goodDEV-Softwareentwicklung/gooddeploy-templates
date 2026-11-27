import type { UiHeading } from "./types.ts";

/** Kopf eines Abschnitts oder Moduls: Dachzeile, Überschrift, Einleitung */
export function SectionHeader({ heading, as: Tag = "h2" }: { heading?: UiHeading; as?: "h2" | "h3" }) {
  if (!heading || (!heading.title && !heading.eyebrow && !heading.intro)) return null;
  return (
    <header className="section__header">
      {heading.eyebrow && <p className="eyebrow">{heading.eyebrow}</p>}
      {heading.title && <Tag className="section__title">{heading.title}</Tag>}
      {heading.intro && <p className="section__intro">{heading.intro}</p>}
    </header>
  );
}
