import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./MoreLink.module.css";
import type { UiLink } from "./types.ts";

export function MoreLink({ link }: { link: UiLink }) {
  return (
    <Link href={link.href} className={styles.link} {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {link.label} <ArrowRight size={18} aria-hidden />
    </Link>
  );
}
