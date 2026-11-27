import { ButtonRow } from "./Button.tsx";
import { Image } from "./Image.tsx";
import styles from "./MediaText.module.css";
import type { UiImage, UiLink, UiRichText } from "./types.ts";

/** Bild neben Text (zweispaltig) */
export function MediaText({
  image,
  imagePosition,
  eyebrow,
  title,
  content,
  links,
  stacked = false,
}: {
  image?: UiImage;
  imagePosition: "left" | "right";
  eyebrow?: string;
  title?: string;
  content?: UiRichText;
  links: UiLink[];
  /** In schmalen Spalten Bild über Text */
  stacked?: boolean;
}) {
  const classes = [stacked ? styles.stacked : styles.columns, imagePosition === "right" && styles.right].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      {image && (
        <div className={styles.image}>
          <Image image={image} sizes={stacked ? "(max-width: 860px) 100vw, 50vw" : undefined} />
        </div>
      )}
      <div className={styles.body}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2 className="section__title">{title}</h2>}
        {content}
        <ButtonRow links={links} />
      </div>
    </div>
  );
}
