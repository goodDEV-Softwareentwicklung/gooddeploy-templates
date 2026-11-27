"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties, type FocusEvent } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./NavGroup.module.css";
import type { UiNavItem } from "./navigation.ts";

type NavGroupProps = {
  item: UiNavItem;
  /** aktueller Pfad, für aria-current und zum Schließen nach einer Navigation */
  path: string;
  /** Klasse der Hauptpunkte im Kopf, damit Gruppe und Link gleich aussehen */
  linkClassName: string;
  /** z. B. Reihenfolge `--_i` für das Einblenden im mobilen Menü */
  style?: CSSProperties;
};

/**
 * Menüpunkt mit Unterpunkten: Aufklappen per Knopf (Klick, Enter, Leertaste),
 * kein reines Hover. Escape schließt und setzt den Fokus auf den Knopf, ein
 * Klick außerhalb oder Fokus außerhalb der Gruppe schließt ebenfalls.
 */
export function NavGroup({ item, path, linkClassName, style }: NavGroupProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  // Offen nur auf dem Pfad, auf dem geöffnet wurde: nach einer Navigation zu.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const open = openOnPath === path;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpenOnPath(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenOnPath(null);
      if (root.current?.contains(document.activeElement)) toggle.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && !event.currentTarget.contains(next)) setOpenOnPath(null);
  };

  const childActive = item.children.some((child) => child.href === path);
  const className = [styles.group, childActive ? styles.groupActive : ""].filter(Boolean).join(" ");

  return (
    <div className={className} ref={root} onBlur={onBlur} style={style}>
      {item.href ? (
        <Link
          href={item.href}
          className={linkClassName}
          aria-current={path === item.href ? "page" : undefined}
          {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {item.label}
        </Link>
      ) : null}
      <button
        ref={toggle}
        type="button"
        className={item.href ? styles.toggle : `${linkClassName} ${styles.groupButton}`}
        aria-expanded={open}
        aria-controls={id}
        aria-label={item.href ? `Unterpunkte zu ${item.label}` : undefined}
        onClick={() => setOpenOnPath(open ? null : path)}
      >
        {item.href ? null : item.label}
        <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
      </button>
      <ul id={id} className={styles.submenu} hidden={!open}>
        {item.children.map((child) => (
          <li key={`${child.href}|${child.label}`}>
            <Link
              href={child.href}
              className={styles.sublink}
              aria-current={path === child.href ? "page" : undefined}
              {...(child.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
