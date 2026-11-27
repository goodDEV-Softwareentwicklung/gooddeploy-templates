import { Mail, Phone } from "lucide-react";
import { Avatar } from "./Avatar.tsx";
import { SectionHeader } from "./SectionHeader.tsx";
import styles from "./Team.module.css";
import type { UiHeading, UiImage } from "./types.ts";

export type TeamMember = {
  name: string;
  role?: string;
  image?: UiImage;
  email?: string;
  phone?: string;
};

/** Personen mit Foto oder Initialen, optional mit E-Mail und Telefon */
export function Team({ heading, members, showContact = false }: { heading?: UiHeading; members: TeamMember[]; showContact?: boolean }) {
  return (
    <div>
      <SectionHeader heading={heading} />
      <ul className={styles.team}>
        {members.map((member, index) => (
          <li key={`${member.name}-${index}`} className={styles.member}>
            <Avatar name={member.name} image={member.image} size="lg" />
            <strong>{member.name}</strong>
            {member.role && <span className={styles.role}>{member.role}</span>}
            {showContact && (member.email || member.phone) && (
              <span className={styles.contact}>
                {member.email && (
                  <a href={`mailto:${member.email}`}>
                    <Mail size={15} aria-hidden /> {member.email}
                  </a>
                )}
                {member.phone && (
                  <a href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}>
                    <Phone size={15} aria-hidden /> {member.phone}
                  </a>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
