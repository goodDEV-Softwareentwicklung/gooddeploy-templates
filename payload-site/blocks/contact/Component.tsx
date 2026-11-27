import type { ContactBlock } from "../../payload-types.ts";
import { Contact } from "../../ui/Contact.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { toHeading, toImage } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function ContactComponent({ block, context }: BlockComponentProps<ContactBlock>) {
  const person = typeof block.contactPerson === "object" ? block.contactPerson : undefined;
  return (
    <BlockFrame context={context}>
      <Contact
        heading={toHeading(block)}
        info={{
          person: person ? { name: person.name, role: person.role ?? undefined, image: toImage(person.image) } : undefined,
          address: block.address ?? undefined,
          email: block.email ?? undefined,
          phone: block.phone ?? undefined,
          hoursTitle: block.hoursTitle ?? undefined,
          hours: block.hours ?? undefined,
        }}
      />
    </BlockFrame>
  );
}
