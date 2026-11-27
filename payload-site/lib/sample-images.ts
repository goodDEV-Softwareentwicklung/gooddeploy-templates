// Beispielbilder der Vorlage (public/samples/, Fotos von Unsplash, Credits in
// public/samples/CREDITS.md, nicht unter MIT). Die Beispielinhalte (lib/seed.ts)
// legen für jedes Bild einen Eintrag in „Bilder“ an, ohne Datei in S3: Die
// Adresse zeigt auf die Datei in public/. So hat die Website auch ohne
// S3-Speicher Bilder. Eigene Uploads (mit S3) ersetzen sie im Modul; ein
// Beispielbild löschst du unter „Bilder“ wie jedes andere.

export const samplesPath = "/samples";

export type SampleImage = {
  filename: string;
  alt: string;
  width: number;
  height: number;
  filesize: number;
};

export const sampleImages = [
  { filename: "meeting-room.webp", alt: "Heller Besprechungsraum mit langem Tisch und Fensterfront", width: 1600, height: 1067, filesize: 98304 },
  { filename: "facade-white.webp", alt: "Weiße Fassade eines modernen Bürogebäudes vor blauem Himmel", width: 1400, height: 1982, filesize: 100970 },
  { filename: "facade-slats.webp", alt: "Gebäude mit rotbraunen Lamellen vor blauem Himmel", width: 1600, height: 1067, filesize: 104906 },
  { filename: "desk-lamp.webp", alt: "Schreibtischlampe auf einem Holztisch vor heller Wand", width: 1600, height: 1100, filesize: 31022 },
  { filename: "workspace.webp", alt: "Ruhiger Arbeitsplatz mit Holztisch, Stuhl und Lampe", width: 1400, height: 1747, filesize: 90326 },
] as const satisfies readonly SampleImage[];

export type SampleFilename = (typeof sampleImages)[number]["filename"];

const filenames = new Set<string>(sampleImages.map((image) => image.filename));

export function isSampleFilename(value: unknown): value is SampleFilename {
  return typeof value === "string" && filenames.has(value);
}

/** Adresse eines Beispielbilds in public/, sonst `undefined` */
export function sampleImageUrl(doc: { sample?: boolean | null; filename?: string | null } | null | undefined): string | undefined {
  if (!doc?.sample || !isSampleFilename(doc.filename)) return undefined;
  return `${samplesPath}/${doc.filename}`;
}
