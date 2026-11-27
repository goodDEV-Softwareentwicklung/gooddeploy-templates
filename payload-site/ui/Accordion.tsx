import { ChevronDown } from "lucide-react";
import { SectionHeader } from "./SectionHeader.tsx";
import styles from "./Accordion.module.css";
import type { UiHeading, UiRichText } from "./types.ts";

export type AccordionItem = { title: string; content: UiRichText; open: boolean };

/** Aufklappbare Einträge mit <details>, funktioniert ohne JavaScript */
export function Accordion({ heading, items }: { heading?: UiHeading; items: AccordionItem[] }) {
  return (
    <div>
      <SectionHeader heading={heading} />
      <div className={styles.items}>
        {items.map((item, index) => (
          <details key={`${item.title}-${index}`} className={styles.item} open={item.open}>
            <summary className={styles.summary}>
              <span>{item.title}</span>
              <ChevronDown className={styles.icon} size={22} aria-hidden />
            </summary>
            <div className={styles.content}>{item.content}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
