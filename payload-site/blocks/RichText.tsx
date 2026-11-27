import { type JSXConvertersFunction, RichText as LexicalRichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { RichTextButtonBlock, RichTextInfoBoxBlock } from "../payload-types.ts";
import { Button } from "../ui/Button.tsx";
import { InfoBox } from "../ui/InfoBox.tsx";
import { type LinkData, toLink } from "./mappers.ts";
import { richTextLinkConverters } from "./richTextLinks.ts";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...richTextLinkConverters,
  blocks: {
    button: ({ node }: { node: { fields: RichTextButtonBlock } }) => {
      const link = toLink(node.fields.link as LinkData);
      return link ? <Button link={link} /> : null;
    },
    infoBox: ({ node }: { node: { fields: RichTextInfoBoxBlock } }) => (
      <InfoBox tone={node.fields.tone ?? "surface"} title={node.fields.title ?? undefined} text={node.fields.text} />
    ),
  },
});

/** Lexical-Inhalt als JSX; Bausteine im Text (Knopf, Hinweiskasten) über ui/ */
export function RichText({ data, className = "prose" }: { data: SerializedEditorState | null | undefined; className?: string }) {
  if (!data) return null;
  return <LexicalRichText data={data} converters={converters} className={className} disableContainer={false} />;
}
