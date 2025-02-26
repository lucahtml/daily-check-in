import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Seite nicht gefunden</h1>
      <p className="text-lg mb-8">Die gesuchte Seite existiert nicht.</p>
      <Link href="/" className="btn-primary">
        Zurück zur Startseite
      </Link>
    </div>
  );
}
