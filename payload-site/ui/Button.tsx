import Link from "next/link";
import styles from "./Button.module.css";
import type { UiLink, UiLinkAppearance } from "./types.ts";

/** Klassen eines Knopfs, auch für <button> in Formularen */
export function buttonClassName({
  appearance = "accent",
  size,
  block = false,
}: {
  appearance?: UiLinkAppearance;
  size?: "lg";
  block?: boolean;
} = {}): string {
  return [styles.btn, styles[appearance], size === "lg" && styles.lg, block && styles.block].filter(Boolean).join(" ");
}

export function Button({ link, size, block = false }: { link: UiLink; size?: "lg"; block?: boolean }) {
  const classes = buttonClassName({ appearance: link.appearance ?? "accent", size, block });
  const external = /^https?:\/\//.test(link.href);
  const target = link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return external ? (
    <a href={link.href} className={classes} {...target}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={classes} {...target}>
      {link.label}
    </Link>
  );
}

export function ButtonRow({ links, size }: { links: UiLink[]; size?: "lg" }) {
  if (links.length === 0) return null;
  return (
    <div className={styles.row}>
      {links.map((link, index) => (
        <Button key={`${link.href}-${index}`} link={link} size={size} />
      ))}
    </div>
  );
}
