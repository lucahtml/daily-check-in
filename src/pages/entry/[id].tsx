import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DailyEntry, BedtimeRoutineStatus } from '@/lib/storage';

export default function EntryDetail() {
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntry = () => {
      try {
        if (typeof window !== 'undefined') {
          // Get the ID from the URL path
          const pathParts = window.location.pathname.split('/');
          const id = pathParts[pathParts.length - 1]; // Get the ID from the path
          
          if (id) {
            // Get entries from localStorage
            const storageKey = 'daily-check-in-entries';
            const entriesJson = localStorage.getItem(storageKey);
            
            if (entriesJson) {
              const entries = JSON.parse(entriesJson);
              const foundEntry = entries.find((e: DailyEntry) => e.id === id);
              setEntry(foundEntry || null);
            }
          }
        }
      } catch (error) {
        console.error('Error loading entry:', error);
      }
      
      setLoading(false);
    };
    
    loadEntry();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Eintrag wird geladen...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-8 card">
        <h2 className="text-xl font-semibold mb-4">Eintrag nicht gefunden</h2>
        <p className="text-gray-500 mb-4">Der gesuchte Eintrag existiert nicht oder wurde gelöscht.</p>
        <Link href="/" className="text-primary hover:underline">
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  // Format date
  const formattedDate = new Date(entry.date).toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper function to get bedtime routine text
  const getBedtimeRoutineText = (status: BedtimeRoutineStatus) => {
    switch (status) {
      case BedtimeRoutineStatus.COMPLETED:
        return 'Vollständig durchgeführt';
      case BedtimeRoutineStatus.PARTIAL:
        return 'Teilweise durchgeführt';
      case BedtimeRoutineStatus.SKIPPED:
        return 'Übersprungen';
      default:
        return 'Unbekannt';
    }
  };

  return (
    <div className="space-y-6">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold text-primary">Tageseintrag</h1>
        <p className="text-gray-600">{formattedDate}</p>
      </header>

      {/* Energy and Mood */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Wie war dein Tag?</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600">Energie</p>
            <p className="text-2xl font-bold text-blue-600">{entry.energyLevel}/10</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-gray-600">Stimmung</p>
            <p className="text-2xl font-bold text-green-600">{entry.mood}/10</p>
          </div>
        </div>
      </div>
      
      {/* Exercise */}
      {entry.exercise && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Hast du heute Sport gemacht?</h2>
          {entry.exercise.didExercise ? (
            <div className="space-y-4">
              {entry.exercise.activities.map((activity, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{activity.type}</p>
                  <p className="text-gray-500">{activity.duration} Minuten</p>
                  {activity.time && <p className="text-gray-500">Um {activity.time} Uhr</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nein, kein Sport heute.</p>
          )}
        </div>
      )}
      
      {/* Self Care */}
      {entry.selfCare && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Hast du es dir heute gut gehen lassen?</h2>
          <div className="space-y-4">
            {entry.selfCare.sauna?.done && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Sauna</p>
                {entry.selfCare.sauna.duration && (
                  <p className="text-gray-500">{entry.selfCare.sauna.duration} Minuten</p>
                )}
                {entry.selfCare.sauna.time && (
                  <p className="text-gray-500">Um {entry.selfCare.sauna.time} Uhr</p>
                )}
              </div>
            )}
            {entry.selfCare.iceBath?.done && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Eisbad</p>
                {entry.selfCare.iceBath.duration && (
                  <p className="text-gray-500">{entry.selfCare.iceBath.duration} Minuten</p>
                )}
                {entry.selfCare.iceBath.time && (
                  <p className="text-gray-500">Um {entry.selfCare.iceBath.time} Uhr</p>
                )}
              </div>
            )}
            {entry.selfCare.stretching?.done && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Dehnen</p>
                {entry.selfCare.stretching.duration && (
                  <p className="text-gray-500">{entry.selfCare.stretching.duration} Minuten</p>
                )}
                {entry.selfCare.stretching.time && (
                  <p className="text-gray-500">Um {entry.selfCare.stretching.time} Uhr</p>
                )}
              </div>
            )}
            {entry.selfCare.reading?.done && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Lesen</p>
                {entry.selfCare.reading.duration && (
                  <p className="text-gray-500">{entry.selfCare.reading.duration} Minuten</p>
                )}
                {entry.selfCare.reading.time && (
                  <p className="text-gray-500">Um {entry.selfCare.reading.time} Uhr</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Nutrition */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Was hast du heute gegessen?</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-medium">Letzte Mahlzeit</p>
            <p className="text-gray-500">{entry.nutrition?.lastMeal || entry.lastMeal} Uhr</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-medium">Proteinaufnahme</p>
            <p className="text-gray-500">{entry.nutrition?.proteinIntake || entry.proteinIntake} Gramm</p>
          </div>
          {entry.nutrition?.cheatmeal && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">Cheatmeal</p>
              <p className="text-gray-500">{entry.nutrition.cheatmeal}</p>
            </div>
          )}
          {entry.nutrition?.alcohol && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">Alkohol</p>
              <p className="text-gray-500">Ja, um {entry.nutrition.alcoholTime} Uhr</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Sleep */}
      {entry.sleep && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Schlaf</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">Gesamtschlaf</p>
              <p className="text-gray-500">
                {Math.floor(entry.sleep.totalSleep / 60)} Std. {entry.sleep.totalSleep % 60} Min.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">Leichter Schlaf</p>
              <p className="text-gray-500">
                {Math.floor(entry.sleep.lightSleep / 60)} Std. {entry.sleep.lightSleep % 60} Min.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">Tiefer Schlaf</p>
              <p className="text-gray-500">
                {Math.floor(entry.sleep.deepSleep / 60)} Std. {entry.sleep.deepSleep % 60} Min.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">REM-Schlaf</p>
              <p className="text-gray-500">
                {Math.floor(entry.sleep.remSleep / 60)} Std. {entry.sleep.remSleep % 60} Min.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">HRV</p>
              <p className="text-gray-500">{entry.sleep.hrv} ms</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Bedtime Routine */}
      {entry.bedtimeRoutine && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Zu-Bett-Geh-Routine</h2>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-medium">Status</p>
            <p className="text-gray-500">{getBedtimeRoutineText(entry.bedtimeRoutine)}</p>
          </div>
        </div>
      )}
      
      {/* Gratitude */}
      {entry.gratitude && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Wofür bist du heute dankbar?</h2>
          <p className="p-3 bg-gray-50 rounded-md">{entry.gratitude}</p>
        </div>
      )}
      
      {/* Comments */}
      {entry.comments && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Kommentare</h2>
          <p className="p-3 bg-gray-50 rounded-md whitespace-pre-line">{entry.comments}</p>
        </div>
      )}

      <div className="flex justify-center mt-8 mb-16">
        <Link href="/" className="text-primary hover:underline">
          Zurück zur Startseite
        </Link>
        <Link href={`/new-entry/?date=${entry.date}`} className="text-primary hover:underline">
          Bearbeiten
        </Link>
      </div>
    </div>
  );
}
