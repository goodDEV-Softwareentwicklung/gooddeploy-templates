import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Logo.module.css";

/** Logo-Zeichen mit Name und Zusatz (z. B. Ort); mit `href` als Link (Kopf), sonst als Block (Fuß) */
export function Logo({
  mark,
  name,
  place,
  href,
  light = false,
}: {
  mark: ReactNode;
  name: string;
  place?: string;
  href?: string;
  /**
   * auf dunkler Fläche; `'ready'`: das Zeichen ist schon eine helle Fassung, also ohne
   * Plakette aus --logo-mark-dark-*
   */
  light?: boolean | "ready";
}) {
  const className = [styles.logo, light && styles.light, light === "ready" && styles.ready].filter(Boolean).join(" ");
  const content = (
    <>
      <span className={styles.mark}>{mark}</span>
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        {place && <span className={styles.place}>{place}</span>}
      </span>
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
