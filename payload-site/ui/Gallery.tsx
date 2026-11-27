import { Image } from "./Image.tsx";
import styles from "./Gallery.module.css";
import { SectionHeader } from "./SectionHeader.tsx";
import type { UiHeading, UiImage } from "./types.ts";

/** Bilderraster (quadratische Kacheln) */
export function Gallery({ heading, images }: { heading?: UiHeading; images: UiImage[] }) {
  return (
    <div>
      <SectionHeader heading={heading} />
      <div className={styles.gallery}>
        {images.map((image, index) => (
          <Image key={`${image.src}-${index}`} image={image} sizes="(max-width: 760px) 50vw, 25vw" className={styles.image} />
        ))}
      </div>
    </div>
  );
}
