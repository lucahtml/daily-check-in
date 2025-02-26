import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getEntryById, DailyEntry } from '@/lib/storage';
import Link from 'next/link';

export default function EntryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const entryData = getEntryById(id);
      setEntry(entryData || null);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Lade Eintrag...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-8 card">
        <h2 className="text-xl font-semibold mb-4">Eintrag nicht gefunden</h2>
        <p className="text-gray-500 mb-4">Der gesuchte Eintrag existiert nicht oder wurde gelöscht.</p>
        <Link href="/" className="btn-primary">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold text-primary">Eintrag Details</h1>
        <p className="text-gray-600">{formatDate(entry.date)}</p>
      </header>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Schlaf</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Gesamtschlaf</p>
            <p className="font-medium">{entry.sleep.total} Stunden</p>
          </div>
          <div>
            <p className="text-gray-500">Leichter Schlaf</p>
            <p className="font-medium">{entry.sleep.light} Stunden</p>
          </div>
          <div>
            <p className="text-gray-500">Tiefer Schlaf</p>
            <p className="font-medium">{entry.sleep.deep} Stunden</p>
          </div>
          <div>
            <p className="text-gray-500">REM Schlaf</p>
            <p className="font-medium">{entry.sleep.rem} Stunden</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Wohlbefinden</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Energie</p>
            <p className="font-medium">{entry.wellbeing.energy}/10</p>
          </div>
          <div>
            <p className="text-gray-500">Stimmung</p>
            <p className="font-medium">{entry.wellbeing.mood}/10</p>
          </div>
          <div>
            <p className="text-gray-500">Stress</p>
            <p className="font-medium">{entry.wellbeing.stress}/10</p>
          </div>
          <div>
            <p className="text-gray-500">Fokus</p>
            <p className="font-medium">{entry.wellbeing.focus}/10</p>
          </div>
        </div>
      </div>

      {entry.exercise && entry.exercise.activities && entry.exercise.activities.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Bewegung</h2>
          <div className="space-y-4">
            {entry.exercise.activities.map((activity, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{activity.type}</p>
                <p className="text-gray-500">{activity.duration} Minuten</p>
                {activity.intensity && <p className="text-gray-500">Intensität: {activity.intensity}/10</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.selfCare && entry.selfCare.activities && entry.selfCare.activities.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Selbstfürsorge</h2>
          <div className="space-y-4">
            {entry.selfCare.activities.map((activity, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{activity.type}</p>
                <p className="text-gray-500">{activity.duration} Minuten</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.notes && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Notizen</h2>
          <p className="whitespace-pre-wrap">{entry.notes}</p>
        </div>
      )}

      <div className="flex justify-center space-x-4 pt-4">
        <Link href="/" className="btn-secondary">
          Zurück zur Übersicht
        </Link>
        <Link href={`/new-entry?date=${entry.date}`} className="btn-primary">
          Bearbeiten
        </Link>
      </div>
    </div>
  );
}
