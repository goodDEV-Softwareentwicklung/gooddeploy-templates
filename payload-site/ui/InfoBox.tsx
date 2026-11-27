import styles from "./InfoBox.module.css";
import { toneClasses } from "./tones.ts";

export function InfoBox({ tone, title, text }: { tone: "surface" | "primary" | "accent"; title?: string; text: string }) {
  const context = tone === "primary" ? toneClasses.primary : toneClasses.light;
  const className = tone === "surface" ? styles.box : `${styles.box} ${styles[tone]}`;
  return (
    <aside className={`${className} ${context}`}>
      {title && <p className={styles.title}>{title}</p>}
      <p className={styles.text}>{text}</p>
    </aside>
  );
}
