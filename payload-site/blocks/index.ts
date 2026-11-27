import type { Block } from "payload";
import { pageContentBlocks } from "./registry.ts";
import { Reusable } from "./reusable/config.ts";
import { Section } from "./section/config.ts";

/** Blocks-Feld `layout` einer Seite */
export const pageLayoutBlocks: Block[] = [Section, ...pageContentBlocks, Reusable];

/** Inhalt eines wiederverwendbaren Moduls: alles außer einem weiteren Verweis */
export const reusableLayoutBlocks: Block[] = [Section, ...pageContentBlocks];

export { columnBlocks, pageContentBlocks } from "./registry.ts";
