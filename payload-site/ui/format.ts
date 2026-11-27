const titles = /^(dr|prof|dipl|ing|med|phil|rer|nat)\.?$/i;

/** Initialen für den Avatar ohne Foto: „Dr. Anna Maria Beck“ → „AB“ */
export function initials(name: string | null | undefined): string {
  const words = (name ?? "")
    .split(/\s+/)
    .filter((word) => !titles.test(word))
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}
