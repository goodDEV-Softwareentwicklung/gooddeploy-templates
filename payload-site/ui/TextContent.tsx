import { SectionHeader } from "./SectionHeader.tsx";
import styles from "./TextContent.module.css";
import type { UiHeading, UiRichText } from "./types.ts";

/** Kopf und Fließtext; Breite „prose“ (Lesebreite) oder „full“ */
export function TextContent({ heading, content, width }: { heading?: UiHeading; content: UiRichText; width: "prose" | "full" }) {
  return (
    <div className={width === "prose" ? styles.prose : undefined}>
      <SectionHeader heading={heading} />
      {content}
    </div>
  );
}
