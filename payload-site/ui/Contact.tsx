import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Avatar } from "./Avatar.tsx";
import { SectionHeader } from "./SectionHeader.tsx";
import styles from "./Contact.module.css";
import type { UiHeading, UiImage } from "./types.ts";

export type ContactPerson = { name: string; role?: string; image?: UiImage };

export type ContactInfoProps = {
  person?: ContactPerson;
  address?: string;
  email?: string;
  phone?: string;
  hoursTitle?: string;
  hours?: string;
};

function lines(text: string | undefined) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function Lines({ text }: { text: string }) {
  return lines(text).map((line, index) => (
    <span key={`${line}-${index}`} className={styles.line}>
      {line}
    </span>
  ));
}

/** Ansprechperson, Adresse, E-Mail, Telefon und Zeiten */
export function ContactInfo({ person, address, email, phone, hoursTitle, hours }: ContactInfoProps) {
  const hasList = Boolean(address || email || phone || lines(hours).length);
  return (
    <div>
      {person && (
        <div className={styles.person}>
          <Avatar name={person.name} image={person.image} size="lg" />
          <div>
            <strong>{person.name}</strong>
            {person.role && (
              <>
                <br />
                {person.role}
              </>
            )}
          </div>
        </div>
      )}
      {hasList && (
        <ul className={styles.list}>
          {address && (
            <li>
              <MapPin aria-hidden />
              <span>
                <Lines text={address} />
              </span>
            </li>
          )}
          {email && (
            <li>
              <Mail aria-hidden />
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          )}
          {phone && (
            <li>
              <Phone aria-hidden />
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>
            </li>
          )}
          {lines(hours).length > 0 && (
            <li>
              <Clock aria-hidden />
              <span>
                {hoursTitle && <strong className={styles.line}>{hoursTitle}</strong>}
                <Lines text={hours ?? ""} />
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/** Kontaktbereich: Kopf und Kontaktinfos (ohne Formular) */
export function Contact({ heading, info }: { heading?: UiHeading; info: ContactInfoProps }) {
  return (
    <div>
      <SectionHeader heading={heading} />
      <ContactInfo {...info} />
    </div>
  );
}
