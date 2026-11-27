import type { ReactNode } from "react";
import { Section } from "../ui/Section.tsx";
import type { BlockContext } from "./types.ts";

/**
 * Module ohne eigenen Abschnitt bekommen auf oberster Ebene einen schlichten
 * Rahmen (Seitenhintergrund, Inhaltsbreite). In Spalten stehen sie ohne Rahmen.
 */
export function BlockFrame({ context, anchor, children }: { context: BlockContext; anchor?: string | null; children: ReactNode }) {
  if (context.nested) return <div className="block-in-column">{children}</div>;
  return <Section anchor={anchor ?? undefined}>{children}</Section>;
}
