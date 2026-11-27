"use client";
// Farbfeld für die eigenen Farben im Global „Website“ → „Gestaltung“
// (globals/SiteSettings.ts): Farbauswahl neben dem Hex-Feld, Platzhalter aus
// Theme und Farbvariante, Zurücksetzen auf das Theme und Kontrast zur
// Gegenfarbe (WCAG AA). Gespeichert wird weiter der Hex-Wert; die Prüfung am
// Feld (isColor) bleibt.
import type { TextFieldClientComponent, Validate } from "payload";
import { TextInput, useField, useFormFields } from "@payloadcms/ui";
import type { ChangeEvent, CSSProperties } from "react";
import { colorLabels, contrastPartner, contrastRatio, formatContrast, isColor, meetsAA, overridableColors, toSixDigits } from "../../themes/colors.ts";
import type { OverridableColor } from "../../themes/contract.ts";
import { paletteColors } from "../../themes/resolve.ts";
import styles from "./ColorField.module.css";

/** Pfad eines Nachbarfelds in derselben Gruppe, z. B. colors.primary → colors.primaryInk */
function siblingPath(path: string, name: string): string {
  const dot = path.lastIndexOf(".");
  return dot === -1 ? name : `${path.slice(0, dot + 1)}${name}`;
}

function isOverridable(name: string): name is OverridableColor {
  return (overridableColors as string[]).includes(name);
}

export const ColorField: TextFieldClientComponent = (props) => {
  const { field, path: pathFromProps, readOnly, validate } = props;
  const role = isOverridable(field.name) ? field.name : "primary";

  const {
    customComponents: { Description, Error, Label } = {},
    disabled,
    path,
    setValue,
    showError,
    value,
  } = useField<string | null>({ potentiallyStalePath: pathFromProps, validate: validate as Validate | undefined });

  const partnerRole = contrastPartner[role];
  const partnerPath = siblingPath(path, partnerRole);
  // Einzelwerte statt eines neuen Objekts je Aufruf: sonst rendert jedes Farbfeld bei jeder Änderung im Formular.
  const themeId = useFormFields(([fields]) => fields.theme?.value as string | undefined);
  const paletteId = useFormFields(([fields]) => fields.palette?.value as string | undefined);
  const partnerValue = useFormFields(([fields]) => (isOverridable(partnerRole) ? fields[partnerPath]?.value : undefined));

  const defaults = paletteColors(themeId, paletteId);
  const themeValue = defaults[role];
  const own = isColor(value) ? value : undefined;
  const effective = own ?? themeValue;
  const partner = isColor(partnerValue) ? partnerValue : defaults[partnerRole];
  const ratio = contrastRatio(effective, partner);
  const passes = meetsAA(effective, partner);
  const locked = readOnly || disabled;

  return (
    // Zeilen im Admin-Panel verteilen ihre direkten Kinder über --field-width.
    <div className={styles.field} style={{ "--field-width": field.admin?.width } as CSSProperties}>
      <TextInput
        AfterInput={
          <button
            className={styles.reset}
            disabled={locked || !value}
            onClick={() => setValue(null)}
            title={`Auf den Wert aus dem Theme zurücksetzen (${themeValue})`}
            type="button"
          >
            Auf Theme zurücksetzen
          </button>
        }
        BeforeInput={
          <input
            aria-label={`${colorLabels[role]} auswählen`}
            className={styles.swatch}
            disabled={locked}
            onChange={(event) => setValue(event.target.value)}
            type="color"
            value={toSixDigits(effective)}
          />
        }
        Description={Description}
        description={field.admin?.description}
        Error={Error}
        label={field.label}
        Label={Label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
        path={path}
        placeholder={themeValue}
        readOnly={locked}
        showError={showError}
        value={value ?? ""}
      />
      <p aria-live="polite" className={`${styles.hint} ${passes ? styles.pass : styles.fail}`}>
        Kontrast zu „{colorLabels[partnerRole]}“: {formatContrast(ratio)} · AA {passes ? "ja" : "nein (mindestens 4,5:1)"}
        {!own && <span className={styles.source}> · Wert aus dem Theme</span>}
      </p>
    </div>
  );
};
