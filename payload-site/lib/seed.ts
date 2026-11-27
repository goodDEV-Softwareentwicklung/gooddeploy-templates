// Beispielinhalte für den ersten Start: die fiktive Musterfirma GmbH mit
// Startseite, Unterseiten, Personen, Menü, Fuß, einer Weiterleitung und den
// Beispielbildern der Vorlage (lib/sample-images.ts, auch ohne S3). Alle Seiten
// sind veröffentlicht. Sie zeigen, was die Module können.
//
// Läuft in lib/migrate-on-start.ts unter derselben Sperre wie die
// Migrationen, nur solange es weder ein Konto noch eine Seite gibt: Sobald
// jemand das erste Konto angelegt hat, kommen gelöschte Beispiele nie zurück.
// Über die Local API mit dem aktuellen Schema (nach allen Migrationen), in
// einer Transaktion: ganz oder gar nicht.
import { commitTransaction, createLocalReq, initTransaction, killTransaction, type Payload } from "payload";
import { sampleImages, type SampleFilename } from "./sample-images.ts";

type Node = Record<string, unknown>;

const text = (value: string, format = 0): Node => ({ type: "text", text: value, format, detail: 0, mode: "normal", style: "", version: 1 });
const element = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
  ...extra,
});
const paragraph = (...children: Node[]) => element("paragraph", children, { textFormat: 0, textStyle: "" });
const list = (...items: string[]) =>
  element(
    "list",
    items.map((item, i) => element("listitem", [text(item)], { value: i + 1 })),
    { listType: "bullet", start: 1, tag: "ul" },
  );
const heading = (value: string, tag: "h2" | "h3" = "h2") => element("heading", [text(value)], { tag });
/** Lexical-Inhalt; Zeichenketten werden zu Absätzen */
const richText = (...nodes: (Node | string)[]) => ({
  root: element(
    "root",
    nodes.map((n) => (typeof n === "string" ? paragraph(text(n)) : n)),
  ),
});
const bold = 1;

type Appearance = "accent" | "primary" | "outline";
const pageLink = (id: number, label: string, appearance?: Appearance) => ({
  type: "reference" as const,
  reference: id,
  label,
  ...(appearance ? { appearance } : {}),
});

/** true, wenn Beispielinhalte angelegt werden sollen: noch kein Konto und keine Seite */
export async function shouldSeed(payload: Payload): Promise<boolean> {
  const [users, pages] = await Promise.all([
    payload.count({ collection: "users", overrideAccess: true }),
    payload.count({ collection: "pages", overrideAccess: true }),
  ]);
  return users.totalDocs === 0 && pages.totalDocs === 0;
}

/** Legt die Beispielinhalte an (ganz oder gar nicht). Gibt die Zahl der Seiten zurück. */
export async function seedDemo(payload: Payload): Promise<number> {
  const req = await createLocalReq({}, payload);
  const owns = await initTransaction(req);
  try {
    const count = await createDemo(payload, req);
    if (owns) await commitTransaction(req);
    return count;
  } catch (err) {
    if (owns) await killTransaction(req);
    throw err;
  }
}

async function createDemo(payload: Payload, req: Awaited<ReturnType<typeof createLocalReq>>): Promise<number> {
  const opts = { req, overrideAccess: true } as const;

  // Beispielbilder: Einträge in „Bilder“ ohne Datei in S3 (die Datei liegt in
  // public/samples/). Direkt über die Datenbank, weil Payload sonst eine
  // hochgeladene Datei verlangt; die Adresse setzt collections/Media.ts.
  const image: Record<SampleFilename, number> = {} as Record<SampleFilename, number>;
  for (const sample of sampleImages) {
    const doc = await payload.db.create({
      collection: "media",
      data: { ...sample, mimeType: "image/webp", focalX: 50, focalY: 50, sample: true },
      req,
    });
    image[sample.filename] = doc.id as number;
  }

  const person = async (name: string, role: string, email: string, phone?: string) =>
    (await payload.create({ collection: "people", data: { name, role, email, phone }, ...opts })).id;
  const anna = await person("Anna Beispiel", "Geschäftsführerin", "anna.beispiel@example.com", "+49 123 456789-10");
  const jonas = await person("Jonas Muster", "Leitung Technik", "jonas.muster@example.com");
  const lea = await person("Lea Probst", "Kundenservice", "lea.probst@example.com", "+49 123 456789-20");
  const mehmet = await person("Mehmet Vorlage", "Projektleitung", "mehmet.vorlage@example.com");

  // Erst alle Seiten anlegen, dann die Module: Knöpfe und Menü verweisen auf andere Seiten.
  const pages = [
    {
      slug: "home",
      title: "Startseite",
      description: "Die Musterfirma GmbH plant, baut und betreut digitale Lösungen für den Mittelstand.",
    },
    { slug: "leistungen", title: "Leistungen", description: "Beratung, Umsetzung und Betrieb aus einer Hand." },
    { slug: "ueber-uns", title: "Über uns", description: "Wer hinter der Musterfirma steht." },
    { slug: "kontakt", title: "Kontakt", description: "So erreichst du die Musterfirma." },
    { slug: "impressum", title: "Impressum" },
    { slug: "datenschutz", title: "Datenschutz" },
  ];
  const id: Record<string, number> = {};
  for (const { description, ...page } of pages) {
    id[page.slug] = (
      await payload.create({ collection: "pages", data: { ...page, layout: [], meta: { description }, _status: "published" }, ...opts })
    ).id;
  }

  const cta = await payload.create({
    collection: "reusable-blocks",
    data: {
      title: "Aufruf: Gespräch vereinbaren",
      layout: [
        {
          blockType: "cta",
          eyebrow: "Nächster Schritt",
          title: "Lust auf ein erstes Gespräch?",
          text: "Erzähl uns von deinem Vorhaben. Wir melden uns innerhalb eines Werktags.",
          tone: "primary",
          links: [{ link: pageLink(id.kontakt, "Termin vereinbaren", "accent") }],
        },
      ],
    },
    ...opts,
  });

  const layouts: Record<string, Node[]> = {
    home: [
      {
        blockType: "hero",
        variant: "centered",
        image: image["meeting-room.webp"],
        eyebrow: "Musterfirma GmbH",
        title: "Wir machen Komplexes einfach.",
        text: "Beratung, Software und Betrieb aus einer Hand: Wir begleiten mittelständische Unternehmen von der ersten Idee bis zum laufenden System.",
        links: [
          { link: pageLink(id.leistungen, "Unsere Leistungen", "accent") },
          { link: pageLink(id.kontakt, "Kontakt aufnehmen", "outline") },
        ],
      },
      {
        blockType: "cards",
        eyebrow: "Leistungen",
        title: "Was wir für dich tun",
        intro: "Drei Bereiche, ein Ansprechpartner. Jede Karte ist ein Eintrag im Modul „Kacheln“.",
        style: "icon",
        columns: "3",
        items: [
          {
            icon: "lightbulb",
            title: "Beratung",
            text: "Wir hören zu, ordnen Anforderungen und machen einen Plan, der zu Budget und Zeit passt.",
          },
          { icon: "code", title: "Umsetzung", text: "Websites, Portale und Schnittstellen, sauber gebaut und gut dokumentiert." },
          { icon: "shield", title: "Betrieb", text: "Updates, Sicherungen und Überwachung, damit alles läuft, auch nachts." },
        ],
        moreLink: pageLink(id.leistungen, "Alle Leistungen ansehen"),
      },
      {
        blockType: "stats",
        variant: "band",
        eyebrow: "In Zahlen",
        title: "Seit 2012 an der Seite unserer Kunden",
        items: [
          { value: "120+", label: "abgeschlossene Projekte" },
          { value: "14", label: "Menschen im Team" },
          { value: "98 %", label: "Kunden, die wiederkommen" },
          { value: "24/7", label: "Überwachung im Betrieb" },
        ],
      },
      {
        blockType: "mediaText",
        image: image["workspace.webp"],
        imagePosition: "right",
        eyebrow: "Unser Büro",
        title: "Ruhe zum Nachdenken, Platz zum Ausprobieren",
        content: richText(
          "In unserem Büro in Beispielstadt arbeiten Beratung, Gestaltung und Technik an einem Tisch. Komm vorbei, der Kaffee ist gut.",
        ),
        links: [{ link: pageLink(id["ueber-uns"], "Mehr über uns", "outline") }],
      },
      {
        blockType: "section",
        layout: "halfHalf",
        background: "surface",
        verticalAlign: "center",
        columns: [
          {
            blocks: [
              {
                blockType: "text",
                eyebrow: "Arbeitsweise",
                title: "Klein anfangen, schnell lernen",
                content: richText(
                  "Statt monatelanger Konzepte bauen wir früh etwas, das du ausprobieren kannst. So siehst du nach wenigen Wochen, ob die Richtung stimmt.",
                  list("feste Ansprechperson", "Abstimmung alle zwei Wochen", "transparente Kosten"),
                ),
              },
            ],
          },
          {
            blocks: [
              {
                blockType: "quote",
                text: "Die Musterfirma hat unser Kundenportal in drei Monaten umgesetzt. Seitdem sparen wir jede Woche Stunden.",
                person: "Paula Kundin",
                role: "Leitung Vertrieb, Beispiel AG",
              },
            ],
          },
        ],
      },
      {
        blockType: "team",
        eyebrow: "Team",
        title: "Menschen, mit denen du sprichst",
        people: [anna, jonas, lea, mehmet],
      },
      {
        blockType: "accordion",
        eyebrow: "Fragen",
        title: "Häufige Fragen",
        items: [
          {
            title: "Wie läuft ein Projekt ab?",
            content: richText(
              "Nach einem kostenlosen Erstgespräch erstellen wir ein Angebot mit festen Etappen. Jede Etappe endet mit etwas, das du nutzen kannst.",
            ),
            open: true,
          },
          {
            title: "Arbeitet ihr auch mit bestehenden Systemen?",
            content: richText("Ja. Wir übernehmen gern bestehende Anwendungen und bringen sie Schritt für Schritt auf einen guten Stand."),
          },
          {
            title: "Was kostet eine Website?",
            content: richText(
              "Das hängt vom Umfang ab. Eine typische Unternehmenswebsite mit CMS liegt bei uns zwischen vier und zehn Personentagen.",
            ),
          },
        ],
      },
      { blockType: "reusable", reference: cta.id },
    ],
    leistungen: [
      {
        blockType: "hero",
        variant: "page",
        eyebrow: "Leistungen",
        title: "Beratung, Umsetzung und Betrieb",
        text: "Alles, was eine digitale Lösung braucht, von einem Team.",
      },
      {
        blockType: "cards",
        title: "Unsere Schwerpunkte",
        style: "image",
        columns: "2",
        items: [
          {
            icon: "target",
            title: "Strategie und Konzept",
            text: "Workshops, Anforderungen und ein klarer Fahrplan.",
            details: [{ text: "Bestandsaufnahme" }, { text: "Ziele und Kennzahlen" }, { text: "Fahrplan mit Etappen" }],
          },
          {
            icon: "rocket",
            title: "Websites und Portale",
            text: "Schnell, barrierearm und leicht zu pflegen.",
            details: [{ text: "Gestaltung nach deiner Marke" }, { text: "CMS für die Redaktion" }, { text: "Mehrsprachigkeit" }],
          },
          {
            icon: "settings",
            title: "Schnittstellen",
            text: "Wir verbinden, was zusammengehört.",
            details: [{ text: "ERP und CRM" }, { text: "Zahlungsanbieter" }, { text: "eigene APIs" }],
          },
          {
            icon: "cloud",
            title: "Betrieb und Wartung",
            text: "Damit du dich um dein Geschäft kümmern kannst.",
            details: [{ text: "Updates und Sicherungen" }, { text: "Überwachung" }, { text: "feste Reaktionszeiten" }],
          },
        ],
      },
      {
        blockType: "stats",
        variant: "table",
        eyebrow: "Preise",
        title: "Klare Preise",
        intro: "Alle Preise zuzüglich Umsatzsteuer. Beispielwerte, im Admin-Panel änderbar.",
        items: [
          { value: "kostenlos", label: "Erstgespräch (60 Minuten)" },
          { value: "ab 4.900 €", label: "Website mit CMS" },
          { value: "950 € / Tag", label: "Entwicklung und Beratung" },
          { value: "ab 149 € / Monat", label: "Betrieb und Wartung" },
        ],
      },
      { blockType: "reusable", reference: cta.id },
    ],
    "ueber-uns": [
      {
        blockType: "hero",
        variant: "split",
        image: image["facade-white.webp"],
        eyebrow: "Über uns",
        title: "Ein Team, das zuhört",
        text: "Die Musterfirma GmbH ist ein fiktives Unternehmen. Diese Seite zeigt, wie eine Seite „Über uns“ mit den Modulen aussehen kann.",
      },
      {
        blockType: "text",
        title: "Unsere Geschichte",
        content: richText(
          paragraph(
            text("Gegründet 2012 in Beispielstadt, sind wir heute "),
            text("14 Menschen", bold),
            text(" aus Beratung, Gestaltung und Technik."),
          ),
          "Wir arbeiten für Handwerk, Handel und Dienstleistung, am liebsten langfristig. Viele unserer Kunden begleiten wir seit über fünf Jahren.",
          heading("Was uns wichtig ist", "h3"),
          list("ehrliche Einschätzungen statt Verkaufssprache", "Lösungen, die ihr selbst pflegen könnt", "Daten in Deutschland"),
        ),
      },
      {
        blockType: "stats",
        variant: "timeline",
        eyebrow: "Meilensteine",
        title: "Wie wir gewachsen sind",
        items: [
          { value: "2012", label: "Gründung mit zwei Personen" },
          { value: "2016", label: "Erstes Büro in der Musterstraße" },
          { value: "2020", label: "Eigener Bereich für Betrieb und Wartung" },
          { value: "2025", label: "100. abgeschlossenes Projekt" },
        ],
      },
      {
        blockType: "gallery",
        eyebrow: "Einblicke",
        title: "So arbeiten wir",
        images: [image["facade-slats.webp"], image["meeting-room.webp"], image["desk-lamp.webp"], image["workspace.webp"]],
      },
      { blockType: "team", title: "Ansprechpersonen", people: [anna, jonas, lea, mehmet], showContact: true },
    ],
    kontakt: [
      {
        blockType: "hero",
        variant: "page",
        eyebrow: "Kontakt",
        title: "Wir freuen uns auf deine Nachricht",
        text: "Ruf an oder schreib uns, wir melden uns innerhalb eines Werktags.",
      },
      {
        blockType: "section",
        layout: "twoThirdsOneThird",
        columns: [
          {
            blocks: [
              {
                blockType: "contact",
                title: "So erreichst du uns",
                contactPerson: anna,
                address: "Musterfirma GmbH\nMusterstraße 1\n12345 Beispielstadt",
                email: "hallo@example.com",
                phone: "+49 123 456789-0",
                hoursTitle: "Öffnungszeiten",
                hours: "Montag bis Donnerstag 9 bis 17 Uhr\nFreitag 9 bis 14 Uhr",
              },
            ],
          },
          {
            blocks: [
              {
                blockType: "cta",
                title: "Lieber persönlich?",
                text: "Komm auf einen Kaffee vorbei, nach kurzer Absprache.",
                tone: "surface",
                links: [{ link: { type: "custom", url: "mailto:hallo@example.com", label: "E-Mail schreiben", appearance: "primary" } }],
              },
            ],
          },
        ],
      },
    ],
    impressum: [
      { blockType: "hero", variant: "page", title: "Impressum" },
      {
        blockType: "text",
        content: richText(
          "Beispieltext: Ersetze diese Angaben durch die Angaben deines Unternehmens.",
          paragraph(text("Musterfirma GmbH", bold)),
          "Musterstraße 1, 12345 Beispielstadt",
          "Vertreten durch: Anna Beispiel (Geschäftsführerin)",
          "E-Mail: hallo@example.com",
        ),
      },
    ],
    datenschutz: [
      { blockType: "hero", variant: "page", title: "Datenschutz" },
      { blockType: "text", content: richText("Beispieltext: Hier steht die Datenschutzerklärung deines Unternehmens.") },
    ],
  };
  for (const [slug, layout] of Object.entries(layouts)) {
    await payload.update({ collection: "pages", id: id[slug], data: { layout, _status: "published" } as never, ...opts });
  }

  // Beispiel für eine Weiterleitung: eine alte Adresse zeigt auf „Über uns“.
  await payload.create({
    collection: "redirects",
    data: { from: "/team", to: { type: "reference", reference: { relationTo: "pages", value: id["ueber-uns"] } }, type: "301" },
    ...opts,
  });

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      siteName: "Musterfirma GmbH",
      shortName: "Musterfirma",
      tagline: "Beispielstadt",
      logoIcon: "sparkles",
      description: "Die Musterfirma GmbH plant, baut und betreut digitale Lösungen für den Mittelstand.",
      navigation: [
        { link: pageLink(id.leistungen, "Leistungen") },
        { link: pageLink(id["ueber-uns"], "Über uns") },
        { link: pageLink(id.kontakt, "Kontakt") },
      ],
      headerActions: [{ link: pageLink(id.kontakt, "Termin vereinbaren", "accent") }],
      contactAddress: "Musterstraße 1\n12345 Beispielstadt",
      contactEmail: "hallo@example.com",
      contactPhone: "+49 123 456789-0",
      imprint: pageLink(id.impressum, "Impressum"),
      privacy: pageLink(id.datenschutz, "Datenschutz"),
      theme: "whitelabel",
    } as never,
    ...opts,
  });
  return pages.length;
}
