import { Quote as QuoteMark } from "lucide-react";
import { Avatar } from "./Avatar.tsx";
import styles from "./Quote.module.css";
import type { UiImage } from "./types.ts";

/** Zitat: Fläche in Primärfarbe, Person mit Foto oder Initialen */
export function Quote({ text, person, role, image }: { text: string; person?: string; role?: string; image?: UiImage }) {
  return (
    <figure className={styles.quote}>
      <QuoteMark className={styles.mark} size={44} aria-hidden />
      <blockquote className={styles.text}>{text}</blockquote>
      {person && (
        <figcaption className={styles.person}>
          <Avatar name={person} image={image} />
          <span>
            <strong>{person}</strong>
            {role && (
              <>
                <br />
                {role}
              </>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
