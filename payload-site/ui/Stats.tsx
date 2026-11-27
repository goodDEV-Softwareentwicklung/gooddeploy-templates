import { SectionHeader } from "./SectionHeader.tsx";
import styles from "./Stats.module.css";
import { toneClasses } from "./tones.ts";
import type { UiHeading } from "./types.ts";

export type StatItem = { value: string; label: string };
export type StatsVariant = "band" | "tiles" | "timeline" | "table";

/**
 * Kennzahlen in vier Darstellungen: Band (dunkel, ganze Breite), Kacheln,
 * Zeitleiste (Meilensteine) und Tabelle (z. B. Preise).
 */
export function Stats({
  heading,
  variant,
  items,
  nested = false,
}: {
  heading?: UiHeading;
  variant: StatsVariant;
  items: StatItem[];
  /** In einer Spalte: Band als Kasten statt ganzer Breite */
  nested?: boolean;
}) {
  if (variant === "band") {
    const band = (
      <>
        <div className={styles.header}>
          <div>
            {heading?.eyebrow && <p className="eyebrow">{heading.eyebrow}</p>}
            {heading?.title && <h2 className={styles.title}>{heading.title}</h2>}
          </div>
        </div>
        {heading?.intro && <p className={styles.intro}>{heading.intro}</p>}
        <dl className={styles.figures}>
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className={styles.tile}>
              <dt className={styles.label}>{item.label}</dt>
              <dd className={styles.figure}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </>
    );
    return nested ? (
      <div className={`${styles.band} ${styles.box} ${toneClasses.dark}`}>{band}</div>
    ) : (
      <section className={`${styles.band} ${toneClasses.dark}`}>
        <div className="container">{band}</div>
      </section>
    );
  }

  return (
    <div>
      <SectionHeader heading={heading} />
      {variant === "tiles" && (
        <dl className={styles.tiles}>
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className={`${styles.statTile} ${toneClasses.light}`}>
              <dt className={styles.statLabel}>{item.label}</dt>
              <dd className={styles.statFigure}>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {variant === "timeline" && (
        <ol className={styles.timeline}>
          {items.map((item, index) => (
            <li key={`${item.value}-${index}`}>
              <span className={styles.year}>{item.value}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ol>
      )}
      {variant === "table" && (
        <dl className={styles.fees}>
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className={styles.feesRow}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
