import type { CSSProperties, ReactNode } from "react";
import styles from "./Section.module.css";
import { SectionHeader } from "./SectionHeader.tsx";
import { toneClass, type SectionTone } from "./tones.ts";
import type { UiHeading } from "./types.ts";

export type { SectionTone };
export type SectionWidth = "narrow" | "normal" | "wide";
export type SectionSpacing = "none" | "small" | "normal" | "large";

/**
 * Gemeinsamer Rahmen für Abschnitte: Hintergrund aus dem Theme, Breite,
 * Abstand, Sprungmarke und Kopf. Spalten setzt der Layout-Abschnitt über
 * `columns` (CSS-Grid-Vorlage, z. B. "2fr 1fr").
 */
export function Section({
  tone = "none",
  width = "normal",
  spacing = "normal",
  anchor,
  heading,
  columns,
  align = "top",
  children,
}: {
  tone?: SectionTone;
  width?: SectionWidth;
  spacing?: SectionSpacing;
  anchor?: string;
  heading?: UiHeading;
  columns?: string;
  align?: "top" | "center";
  children: ReactNode;
}) {
  const classes = [styles.section, styles[tone], toneClass(tone), styles[`space-${spacing}`]].filter(Boolean).join(" ");
  const grid = columns ? ({ "--columns": columns } as CSSProperties) : undefined;
  return (
    <section id={anchor || undefined} className={classes}>
      <div className={["container", styles.inner, styles[width]].filter(Boolean).join(" ")}>
        <SectionHeader heading={heading} />
        {columns ? (
          <div className={align === "center" ? `${styles.grid} ${styles.center}` : styles.grid} style={grid}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
