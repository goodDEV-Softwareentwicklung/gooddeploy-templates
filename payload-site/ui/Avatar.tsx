import { Image } from "./Image.tsx";
import styles from "./Avatar.module.css";
import { initials } from "./format.ts";
import type { UiImage } from "./types.ts";

/** Foto im Kreis oder Initialen. Dekorativ: Der Name steht immer daneben. */
export function Avatar({ name, image, size }: { name: string; image?: UiImage; size?: "lg" }) {
  const classes = [styles.avatar, size === "lg" && styles.lg, image && styles.image].filter(Boolean).join(" ");
  if (image) {
    return (
      <span className={classes}>
        <Image image={{ ...image, alt: "" }} sizes={size === "lg" ? "96px" : "50px"} />
      </span>
    );
  }
  return (
    <span className={classes} aria-hidden>
      {initials(name)}
    </span>
  );
}
