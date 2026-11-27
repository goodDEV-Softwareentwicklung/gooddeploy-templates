import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Footer.module.css";
import { Logo } from "./Logo.tsx";
import type { UiLink } from "./types.ts";

export type FooterProps = {
  name: string;
  shortName: string;
  place?: string;
  logo: ReactNode;
  /** `logo` ist schon für dunkle Flächen gemacht (helle Fassung): ohne Plakette (--logo-mark-dark-*) */
  logoForDark?: boolean;
  pages: UiLink[];
  address: string[];
  email?: string;
  phone?: string;
  legal: UiLink[];
  year: number;
};

function LinkList({ links }: { links: UiLink[] }) {
  return (
    <ul className={styles.list}>
      {links.map((link) => (
        <li key={link.href + link.label}>
          <Link href={link.href}>{link.label}</Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer({ name, shortName, place, logo, logoForDark = false, pages, address, email, phone, legal, year }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <Logo mark={logo} name={shortName} place={place} light={logoForDark ? "ready" : true} />
          <p className={styles.text}>{name}</p>
        </div>

        {pages.length > 0 && (
          <div>
            <h3 className={styles.title}>Seiten</h3>
            <LinkList links={pages} />
          </div>
        )}

        {(address.length > 0 || email || phone) && (
          <div>
            <h3 className={styles.title}>Kontakt</h3>
            <p className={styles.text}>
              {address.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
              {email && (
                <>
                  <a href={`mailto:${email}`}>{email}</a>
                  <br />
                </>
              )}
              {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>}
            </p>
          </div>
        )}

        {legal.length > 0 && (
          <div>
            <h3 className={styles.title}>Rechtliches</h3>
            <LinkList links={legal} />
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <span>
          © {year} {name}
        </span>
      </div>
    </footer>
  );
}
