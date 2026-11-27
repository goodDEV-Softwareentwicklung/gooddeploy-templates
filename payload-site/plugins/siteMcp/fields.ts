/**
 * Reine Hilfen über Payload-Felder (ohne Datenbank, unit-getestet):
 * - `describeFields`: kompakte Beschreibung für KI-Clients (`describe_blocks`)
 * - `mapRichText`: Fließtextfelder in Daten umwandeln (Markdown ↔ Lexical)
 *
 * Rein darstellende Felder (row, collapsible, Reiter ohne Namen) werden flach
 * aufgelöst, so wie Payload die Daten speichert.
 */
import type { Block, Field } from "payload";

export type FieldDescription = {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  hasMany?: boolean;
  options?: string[];
  relationTo?: string | string[];
  minRows?: number;
  maxRows?: number;
  /** Unterfelder (array, group) */
  fields?: FieldDescription[];
  /** Erlaubte Module (blocks) */
  blocks?: string[];
  hint?: string;
  /** Nur je nach anderen Feldern sichtbar bzw. nötig (z. B. url nur bei type custom) */
  conditional?: boolean;
};

type AnyField = Field & {
  name?: string;
  label?: unknown;
  required?: boolean;
  hasMany?: boolean;
  options?: unknown[];
  relationTo?: string | string[];
  minRows?: number;
  maxRows?: number;
  fields?: Field[];
  tabs?: { name?: string; fields: Field[] }[];
  blocks?: Block[];
  blockReferences?: (string | Block)[];
  admin?: { hidden?: boolean; disabled?: boolean; condition?: unknown };
};

/** Nur Texte übernehmen, keine Übersetzungsobjekte oder Funktionen */
function text(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "de" in value) {
    const de = (value as { de?: unknown }).de;
    return typeof de === "string" ? de : undefined;
  }
  return undefined;
}

function optionValues(options: unknown[] | undefined): string[] | undefined {
  return options?.map((option) => (typeof option === "string" ? option : String((option as { value: unknown }).value)));
}

/** Blöcke eines Blocks-Felds (inline oder als Referenz auf `config.blocks`) */
export function blocksOf(field: AnyField, shared: readonly Block[] = []): Block[] {
  const inline = field.blocks ?? [];
  const references = (field.blockReferences ?? []).map((ref) => (typeof ref === "string" ? shared.find((block) => block.slug === ref) : ref));
  return [...inline, ...references.filter((block): block is Block => Boolean(block))];
}

/** Felder so, wie sie in den Daten liegen (ohne row/collapsible/unbenannte Reiter) */
export function dataFields(fields: readonly Field[]): AnyField[] {
  return (fields as AnyField[]).flatMap((field): AnyField[] => {
    if (field.type === "ui") return [];
    if (field.type === "row" || field.type === "collapsible") return dataFields(field.fields ?? []);
    if (field.type === "tabs") {
      const tabs = (field as unknown as { tabs?: { name?: string; fields: Field[] }[] }).tabs;
      return (tabs ?? []).flatMap((tab) =>
        tab.name ? [{ type: "group", name: tab.name, fields: tab.fields } as unknown as AnyField] : dataFields(tab.fields),
      );
    }
    return field.name ? [field] : [];
  });
}

/** Interne Felder, die ein KI-Client nicht setzen soll */
const internalFields = new Set(["id", "blockName", "blockType", "_status", "prefix"]);

export function describeFields(fields: readonly Field[], shared: readonly Block[] = []): FieldDescription[] {
  return dataFields(fields)
    .filter((field) => !internalFields.has(field.name!) && !field.admin?.hidden)
    .map((field) => {
      const description: FieldDescription = { name: field.name!, type: field.type };
      const label = text(field.label);
      if (label) description.label = label;
      if (field.required) description.required = true;
      if (field.hasMany) description.hasMany = true;
      const options = optionValues(field.options);
      if (options) description.options = options;
      if (field.relationTo) description.relationTo = field.relationTo;
      if (field.minRows !== undefined) description.minRows = field.minRows;
      if (field.maxRows !== undefined) description.maxRows = field.maxRows;
      if (field.type === "array" || field.type === "group") {
        description.fields = describeFields(field.fields ?? [], shared);
      }
      if (field.type === "blocks") description.blocks = blocksOf(field, shared).map((b) => b.slug);
      if (field.admin?.condition) description.conditional = true;
      if (field.type === "richText") description.hint = "Markdown";
      if (field.type === "upload") description.hint = "Medien-ID (import_image)";
      if (field.relationTo === "people") description.hint = "Personen-ID; nur vorhandene IDs aus read_page, Personen gibt es über MCP nicht";
      if (field.relationTo === "reusable-blocks") description.hint = "ID aus findReusableBlocks";
      return description;
    });
}

export type RichTextTransform = (value: unknown, field: Field) => unknown;

/**
 * Wendet `transform` auf jedes Fließtextfeld an, auch in Gruppen, Listen und
 * verschachtelten Modulen. Unbekannte Module bleiben unverändert (Payload meldet sie).
 */
export function mapRichText<T>(fields: readonly Field[], data: T, transform: RichTextTransform, shared: readonly Block[] = []): T {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const result: Record<string, unknown> = { ...(data as Record<string, unknown>) };
  for (const field of dataFields(fields)) {
    const name = field.name!;
    if (!(name in result)) continue;
    const value = result[name];
    if (value === null || value === undefined) continue;
    switch (field.type) {
      case "richText":
        result[name] = transform(value, field);
        break;
      case "group":
        result[name] = mapRichText(field.fields ?? [], value, transform, shared);
        break;
      case "array":
        if (Array.isArray(value)) {
          result[name] = value.map((row) => mapRichText(field.fields ?? [], row, transform, shared));
        }
        break;
      case "blocks":
        if (Array.isArray(value)) {
          const blocks = blocksOf(field, shared);
          result[name] = value.map((row) => {
            const block = blocks.find((b) => b.slug === (row as { blockType?: string })?.blockType);
            return block ? mapRichText(block.fields, row, transform, shared) : row;
          });
        }
        break;
    }
  }
  return result as T;
}

/** Entfernt Felder, die nur Payload setzt (Status, IDs der Zeilen bleiben erlaubt) */
export function withoutStatus<T extends Record<string, unknown>>(data: T): Omit<T, "_status"> {
  const { _status: _ignored, ...rest } = data;
  return rest;
}

const isEmpty = (value: unknown) => value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

/**
 * Pfade fehlender Pflichtfelder. Payload prüft Pflichtfelder bei Entwürfen nicht;
 * ohne diese Prüfung fielen Lücken erst beim Veröffentlichen auf. Bedingte Felder
 * (admin.condition) und Felder mit Vorgabewert prüft Payload selbst bzw. setzt sie.
 */
export function missingRequired(fields: readonly Field[], data: unknown, shared: readonly Block[] = [], path = ""): string[] {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  return dataFields(fields).flatMap((field) => {
    const name = field.name!;
    const here = path ? `${path}.${name}` : name;
    const value = record[name];
    const hasDefault = "defaultValue" in field && field.defaultValue !== undefined;
    if (field.required && !field.admin?.condition && !hasDefault && isEmpty(value)) return [here];
    if (field.type === "group") return missingRequired(field.fields ?? [], value, shared, here);
    if (field.type === "array" && Array.isArray(value)) {
      return value.flatMap((row, i) => missingRequired(field.fields ?? [], row, shared, `${here}.${i}`));
    }
    if (field.type === "blocks" && Array.isArray(value)) {
      const blocks = blocksOf(field, shared);
      return value.flatMap((row, i) => {
        const block = blocks.find((b) => b.slug === (row as { blockType?: string })?.blockType);
        return block ? missingRequired(block.fields, row, shared, `${here}.${i}`) : [];
      });
    }
    return [];
  });
}
