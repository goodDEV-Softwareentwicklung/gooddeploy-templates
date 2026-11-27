// Bilder für die Module der Seiten. Die Dateien liegen nur in einem S3-Speicher, nie im
// Dateisystem des Containers (E223): Das ist nicht dauerhaft und bei jeder
// Instanz ein anderes. Ohne S3_* ist das Hochladen aus (README, „Bilder hochladen“).
import { APIError, type CollectionConfig } from "payload";

export const uploadsOffMessage =
  "Hochladen ist aus, weil kein S3-Speicher eingerichtet ist: Setz S3_BUCKET, S3_ACCESS_KEY_ID und S3_SECRET_ACCESS_KEY (meist auch S3_ENDPOINT und S3_REGION) und deploye neu.";

// Erlaubte Bildtypen. Kein SVG: SVG kann Skripte enthalten und würde von
// der eigenen Adresse ausgeliefert.
export const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// Größte Datei je Upload (10 MB); gilt in payload.config.ts (upload.limits).
export const maxUploadBytes = 10 * 1024 * 1024;

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export function mediaCollection(uploadsEnabled: boolean): CollectionConfig {
  return {
    slug: "media",
    labels: { singular: "Bild", plural: "Bilder" },
    admin: {
      useAsTitle: "alt",
      group: "Inhalte",
      description: uploadsEnabled ? undefined : uploadsOffMessage,
    },
    access: {
      read: () => true,
      // Ohne S3 zeigt das Admin-Panel keinen Knopf zum Anlegen.
      create: (args) => uploadsEnabled && loggedIn(args),
      update: loggedIn,
      delete: loggedIn,
    },
    hooks: {
      // Zweite Sperre, auch für das Ersetzen einer Datei beim Bearbeiten:
      // ohne S3 keine Datei annehmen.
      beforeOperation: [
        ({ operation, req }) => {
          if (!uploadsEnabled && (operation === "create" || operation === "update") && req.file) {
            throw new APIError(uploadsOffMessage, 400);
          }
        },
      ],
    },
    upload: {
      // Nie auf die Platte: Mit S3 speichert der S3-Adapter (payload.config.ts),
      // ohne S3 gibt es keine Uploads.
      disableLocalStorage: true,
      mimeTypes: imageMimeTypes,
      // Große Fotos beim Hochladen verkleinern (Speicher der Instanz, Ladezeit).
      resizeOptions: { width: 2560, height: 2560, fit: "inside", withoutEnlargement: true },
    },
    fields: [
      {
        name: "alt",
        label: "Alternativtext",
        type: "text",
        required: true,
        admin: { description: "Was ist zu sehen? Für Screenreader und Suchmaschinen." },
      },
    ],
  };
}
