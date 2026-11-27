import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container empty-state">
      <h1>Seite nicht gefunden</h1>
      <p>
        Diese Adresse gibt es nicht. <Link href="/">Zur Startseite</Link>
      </p>
    </section>
  );
}
