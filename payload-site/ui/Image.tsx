import NextImage from "next/image";
import styles from "./Image.module.css";
import type { UiImage } from "./types.ts";

/** Bild, das seinen Container ausfüllt. Der Container bestimmt das Format. */
export function Image({
  image,
  sizes = "(max-width: 800px) 100vw, 50vw",
  priority = false,
  fit = "cover",
  className = "",
}: {
  image: UiImage;
  sizes?: string;
  priority?: boolean;
  /** contain: ganzes Bild zeigen (z. B. Logo) */
  fit?: "cover" | "contain";
  className?: string;
}) {
  const position = image.focalX !== undefined && image.focalY !== undefined ? `${image.focalX}% ${image.focalY}%` : undefined;
  const classes = [styles.media, fit === "contain" && styles.contain, className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <NextImage src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} style={{ objectPosition: position }} />
    </div>
  );
}
