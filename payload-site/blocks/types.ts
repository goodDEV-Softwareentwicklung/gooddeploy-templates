import type { Page } from "../payload-types.ts";

/** Ein Modul aus dem Layout einer Seite (Union aller Modultypen) */
export type LayoutBlock = NonNullable<Page["layout"]>[number];
export type LayoutBlockType = LayoutBlock["blockType"];

export type BlockContext = {
  /** true, wenn das Modul in einer Spalte eines Abschnitts steht */
  nested: boolean;
  /** true, wenn die Spalte die volle Breite hat (Abschnitt mit einer Spalte) */
  fullWidth?: boolean;
};

export type BlockComponentProps<T extends LayoutBlock> = { block: T; context: BlockContext };
