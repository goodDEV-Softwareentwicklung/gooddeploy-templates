import type { ReactNode } from "react";
import { ButtonRow } from "./Button.tsx";
import styles from "./Hero.module.css";
import { Image } from "./Image.tsx";
import type { UiImage, UiLink } from "./types.ts";

export type HeroVariant = "full" | "split" | "centered" | "page";

export type HeroProps = {
  variant: HeroVariant;
  eyebrow?: string;
  title: string;
  text?: string;
  image?: UiImage;
  links: UiLink[];
  /** Kleines Abzeichen am Bild (Variante split), z. B. das Icon der Website */
  badge?: ReactNode;
};

export function Hero({ variant, eyebrow, title, text, image, links, badge }: HeroProps) {
  if (variant === "page") {
    return (
      <section className={image ? `${styles.page} ${styles.pageWithImage}` : styles.page}>
        {image && <Image image={image} sizes="100vw" priority className={styles.pageImage} />}
        <div className={`container ${styles.pageInner}`}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className={styles.pageTitle}>{title}</h1>
          {text && <p className={styles.pageIntro}>{text}</p>}
          <ButtonRow links={links} />
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.hero} ${styles[variant]}`}>
      {variant !== "split" && image && <Image image={image} sizes="100vw" priority className={styles.background} />}
      <div className={styles.inner}>
        <div className={styles.text}>
          {eyebrow && <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {text && <p className={styles.lead}>{text}</p>}
          <ButtonRow links={links} size="lg" />
        </div>
        {variant === "split" && image && (
          <div className={styles.frame}>
            <Image image={image} priority className={styles.image} />
            {badge && <span className={styles.sticker}>{badge}</span>}
          </div>
        )}
      </div>
    </section>
  );
}
