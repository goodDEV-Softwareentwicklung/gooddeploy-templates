import type { TeamBlock } from "../../payload-types.ts";
import { Team, type TeamMember } from "../../ui/Team.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { toHeading, toImage } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function toTeamMembers(people: TeamBlock["people"]): TeamMember[] {
  return (people ?? []).flatMap((person) =>
    typeof person === "object" && person
      ? [
          {
            name: person.name,
            role: person.role ?? undefined,
            image: toImage(person.image),
            email: person.email ?? undefined,
            phone: person.phone ?? undefined,
          },
        ]
      : [],
  );
}

export function TeamComponent({ block, context }: BlockComponentProps<TeamBlock>) {
  const members = toTeamMembers(block.people);
  if (members.length === 0) return null;
  return (
    <BlockFrame context={context}>
      <Team heading={toHeading(block)} members={members} showContact={Boolean(block.showContact)} />
    </BlockFrame>
  );
}
