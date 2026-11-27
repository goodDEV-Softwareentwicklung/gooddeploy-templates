import { ButtonRow } from "./Button.tsx";
import styles from "./CallToAction.module.css";
import { Section } from "./Section.tsx";
import { toneClass } from "./tones.ts";
import type { UiLink } from "./types.ts";

export type CallToActionTone = "primary" | "dark" | "surface";

/**
 * Farbiges Band mit Aufruf und Knöpfen; in Spalten als Kasten. Der helle Ton
 * (surface) steht auch allein als abgesetzte Box im Container, nicht als Band.
 */
export function CallToAction({
  eyebrow,
  title,
  text,
  links,
  tone,
  nested = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  links: UiLink[];
  tone: CallToActionTone;
  nested?: boolean;
}) {
  const content = (
    <div className={styles.cta}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="section__title">{title}</h2>
      {text && <p className="section__intro">{text}</p>}
      <ButtonRow links={links} size={nested ? undefined : "lg"} />
    </div>
  );
  const box = `${styles.box} ${styles[tone]} ${toneClass(tone)}`;
  if (nested) return <div className={box}>{content}</div>;
  if (tone === "surface") {
    return (
      <Section>
        <div className={`${box} ${styles.standalone}`}>{content}</div>
      </Section>
    );
  }
  return <Section tone={tone}>{content}</Section>;
}
