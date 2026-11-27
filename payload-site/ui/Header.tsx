"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { buttonClassName } from "./Button.tsx";
import styles from "./Header.module.css";
import { Logo } from "./Logo.tsx";
import { NavGroup } from "./NavGroup.tsx";
import type { UiNavItem } from "./navigation.ts";
import type { UiLink } from "./types.ts";

export type HeaderProps = {
  homeHref: string;
  name: string;
  place?: string;
  logo: ReactNode;
  /** Hauptpunkte, je mit optionalen Unterpunkten (eine Ebene) */
  navigation: UiNavItem[];
  /** Knöpfe neben dem Menü (höchstens zwei), auf dem Smartphone unten im Menü */
  actions?: UiLink[];
};

function HeaderAction({ link, style }: { link: UiLink; style: CSSProperties }) {
  const classes = [buttonClassName({ appearance: link.appearance ?? "accent" }), styles.action].join(" ");
  return (
    <Link href={link.href} className={classes} style={style} {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {link.label}
    </Link>
  );
}

export function Header({ homeHref, name, place, logo, navigation, actions = [] }: HeaderProps) {
  const path = usePathname();
  // Menü gilt nur für den Pfad, auf dem es geöffnet wurde: Nach einer Navigation ist es zu.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const open = openOnPath === path;
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // Höhe des Kopfs als CSS-Variable: Das mobile Menü beginnt direkt darunter.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    const update = () => el.style.setProperty("--_header-height", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Offenes Menü: Seite dahinter scrollt nicht, Escape schließt und setzt den Fokus zurück.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Ist ein Untermenü offen, schließt Escape zuerst nur dieses (NavGroup)
      if (header.current?.querySelector('nav [aria-controls][aria-expanded="true"]')) return;
      setOpenOnPath(null);
      toggle.current?.focus();
    };
    // Breiter als das mobile Menü (siehe Header.module.css): schließen, sonst bliebe die Seite gesperrt
    const wide = window.matchMedia("(min-width: 921px)");
    const onWide = () => wide.matches && setOpenOnPath(null);
    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  // Reihenfolge für das gestaffelte Einblenden im mobilen Menü
  const order = (index: number) => ({ "--_i": index }) as CSSProperties;

  return (
    <header className={styles.header} ref={header}>
      <div className={styles.inner}>
        <Logo href={homeHref} mark={logo} name={name} place={place} />

        <nav className={open ? `${styles.nav} ${styles.open}` : styles.nav} aria-label="Hauptnavigation">
          {navigation.map((item, index) =>
            item.children.length > 0 ? (
              <NavGroup key={`${item.label}|${item.href ?? ""}`} item={item} path={path} linkClassName={styles.link} style={order(index)} />
            ) : item.href ? (
              <Link
                key={`${item.label}|${item.href}`}
                href={item.href}
                className={styles.link}
                style={order(index)}
                aria-current={path === item.href ? "page" : undefined}
                {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.label}
              </Link>
            ) : null,
          )}
          {actions.map((link, index) => (
            <HeaderAction key={index} link={link} style={order(navigation.length + index)} />
          ))}
        </nav>

        <button
          ref={toggle}
          type="button"
          className={styles.menu}
          onClick={() => setOpenOnPath(open ? null : path)}
          aria-expanded={open}
          aria-label={open ? "Menü schließen" : "Menü"}
        >
          <span className={styles.bars} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>
  );
}
