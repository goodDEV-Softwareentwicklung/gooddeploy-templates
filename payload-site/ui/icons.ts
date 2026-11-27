// Auswahl der Icons im Admin-Panel (ohne React, damit Sammlungen und Tests sie
// laden können). Die Zuordnung zu den Zeichen steht in Icon.tsx.
export const iconOptions = [
  { value: "briefcase", label: "Aktenkoffer" },
  { value: "users", label: "Menschen" },
  { value: "handshake", label: "Handschlag" },
  { value: "lightbulb", label: "Glühbirne" },
  { value: "rocket", label: "Rakete" },
  { value: "target", label: "Ziel" },
  { value: "chart", label: "Diagramm" },
  { value: "shield", label: "Schild" },
  { value: "award", label: "Auszeichnung" },
  { value: "star", label: "Stern" },
  { value: "sparkles", label: "Funkeln" },
  { value: "heart", label: "Herz" },
  { value: "leaf", label: "Blatt" },
  { value: "globe", label: "Globus" },
  { value: "clock", label: "Uhr" },
  { value: "calendar", label: "Kalender" },
  { value: "wrench", label: "Werkzeug" },
  { value: "settings", label: "Zahnrad" },
  { value: "code", label: "Code" },
  { value: "cloud", label: "Wolke" },
  { value: "truck", label: "Lastwagen" },
  { value: "building", label: "Gebäude" },
  { value: "home", label: "Haus" },
  { value: "message", label: "Sprechblase" },
  { value: "check", label: "Haken" },
] as const;

export type IconName = (typeof iconOptions)[number]["value"];
