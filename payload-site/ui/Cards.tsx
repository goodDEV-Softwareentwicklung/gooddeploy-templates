import Link from "next/link";
import styles from "./Cards.module.css";
import { Icon } from "./Icon.tsx";
import { Image } from "./Image.tsx";
import { MoreLink } from "./MoreLink.tsx";
import { SectionHeader } from "./SectionHeader.tsx";
import { toneClasses } from "./tones.ts";
import type { UiHeading, UiImage, UiLink } from "./types.ts";

export type CardItem = {
  title: string;
  text?: string;
  icon?: string;
  image?: UiImage;
  tag?: string;
  details: string[];
  href?: string;
  /** Link in neuem Tab (z. B. Website eines Partners) */
  newTab?: boolean;
};

/** Raster-Klassen je Spaltenzahl */
export function cardGridClassName(columns: 2 | 3 | 4): string {
  const column = { 2: styles.columns2, 3: styles.columns3, 4: styles.columns4 }[columns];
  return `${styles.grid} ${column}`;
}

export type CardsProps = {
  heading?: UiHeading;
  style: "image" | "icon" | "logo";
  columns: 2 | 3 | 4;
  items: CardItem[];
  moreLink?: UiLink;
};

function CardTitle({ item, className }: { item: CardItem; className: string }) {
  return <h3 className={className}>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h3>;
}

/** Logo eines Partners: ganz sichtbar auf heller Fläche, Name darunter, ganze Kachel verlinkt */
function LogoTile({ item }: { item: CardItem }) {
  const content = (
    <>
      <span className={styles.logoFrame}>
        {item.image ? <Image image={item.image} fit="contain" sizes="240px" /> : <span className={styles.logoFallback}>{item.title}</span>}
      </span>
      <span className={styles.logoName}>{item.title}</span>
    </>
  );
  if (!item.href) return <div className={styles.logo}>{content}</div>;
  return (
    <Link href={item.href} className={styles.logo} {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {content}
    </Link>
  );
}

/** Karten mit Bild, Icon-Kacheln oder Logos */
export function Cards({ heading, style, columns, items, moreLink }: CardsProps) {
  return (
    <div>
      <SectionHeader heading={heading} />
      <div className={style === "logo" ? `${cardGridClassName(columns)} ${styles.logoGrid}` : cardGridClassName(columns)}>
        {items.map((item, index) =>
          style === "logo" ? (
            <LogoTile key={`${item.title}-${index}`} item={item} />
          ) : style === "icon" ? (
            <div key={`${item.title}-${index}`} className={`${styles.tile} ${toneClasses.light}`}>
              {item.icon && (
                <span className={styles.icon}>
                  <Icon name={item.icon} />
                </span>
              )}
              <CardTitle item={item} className={styles.tileTitle} />
              {item.text && <p className={styles.tileText}>{item.text}</p>}
            </div>
          ) : (
            <article key={`${item.title}-${index}`} className={`${styles.card} ${toneClasses.light}`}>
              {item.image && (
                <div className={styles.frame}>
                  <Image image={item.image} sizes={`(max-width: 800px) 100vw, ${Math.round(100 / columns)}vw`} />
                  {item.tag && <span className={styles.tag}>{item.tag}</span>}
                </div>
              )}
              <div className={styles.body}>
                {item.icon && (
                  <span className={styles.icon}>
                    <Icon name={item.icon} />
                  </span>
                )}
                <CardTitle item={item} className={styles.title} />
                {item.text && <p className={styles.text}>{item.text}</p>}
                {item.details.length > 0 && (
                  <ul className={styles.details}>
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ),
        )}
      </div>
      {moreLink && <MoreLink link={moreLink} />}
    </div>
  );
}
