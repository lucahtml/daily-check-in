'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEntries, DailyEntry, deleteEntry, BedtimeRoutineStatus } from '@/lib/storage';

interface EntryDetailPageProps {
  params: {
    id: string;
  };
}

export default function EntryDetailPage({ params }: EntryDetailPageProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = params;

  useEffect(() => {
    const loadEntry = () => {
      const entries = getEntries();
      const foundEntry = entries.find(e => e.id === id);
      
      if (foundEntry) {
        setEntry(foundEntry);
      }
      
      setIsLoading(false);
    };
    
    loadEntry();
  }, [id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get bedtime routine text
  const getBedtimeRoutineText = (status: BedtimeRoutineStatus) => {
    switch (status) {
      case BedtimeRoutineStatus.COMPLETED:
        return 'Vollständig eingehalten';
      case BedtimeRoutineStatus.PARTIAL:
        return 'Teilweise eingehalten';
      case BedtimeRoutineStatus.SKIPPED:
        return 'Nicht eingehalten';
      default:
        return 'Keine Angabe';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      setIsDeleting(true);
      deleteEntry(id);
      
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Lade Eintrag...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-8">
        <h1 className="text-xl font-bold mb-4">Eintrag nicht gefunden</h1>
        <p className="mb-4">Der gesuchte Eintrag existiert nicht oder wurde gelöscht.</p>
        <Link href="/" className="btn-primary">
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-primary hover:underline">
          &larr; Zurück
        </Link>
        <div className="flex space-x-2">
          <Link 
            href={`/new-entry?date=${entry.date}`} 
            className="text-primary hover:underline"
          >
            Bearbeiten
          </Link>
          <button 
            onClick={handleDelete}
            className="text-red-500 hover:underline"
            disabled={isDeleting}
          >
            {isDeleting ? 'Löschen...' : 'Löschen'}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">{formatDate(entry.date)}</h1>

      <div className="space-y-6">
        {/* Sleep Section */}
        <section className="card">
          <h2 className="text-lg font-semibold mb-3">Schlaf</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Gesamte Schlafzeit:</p>
              <p className="font-medium">
                {Math.floor(entry.sleep.totalSleep / 60)} Std. {entry.sleep.totalSleep % 60} Min.
              </p>
            </div>
            <div>
              <p className="text-gray-600">Leichter Schlaf:</p>
              <p className="font-medium">
                {Math.floor(entry.sleep.lightSleep / 60)} Std. {entry.sleep.lightSleep % 60} Min.
              </p>
            </div>
            <div>
              <p className="text-gray-600">Tiefer Schlaf:</p>
              <p className="font-medium">
                {Math.floor(entry.sleep.deepSleep / 60)} Std. {entry.sleep.deepSleep % 60} Min.
              </p>
            </div>
            <div>
              <p className="text-gray-600">REM-Schlaf:</p>
              <p className="font-medium">
                {Math.floor(entry.sleep.remSleep / 60)} Std. {entry.sleep.remSleep % 60} Min.
              </p>
            </div>
            <div>
              <p className="text-gray-600">HRV:</p>
              <p className="font-medium">{entry.sleep.hrv} ms</p>
            </div>
          </div>
        </section>

        {/* Nutrition Section */}
        <section className="card">
          <h2 className="text-lg font-semibold mb-3">Ernährung</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Letzte Mahlzeit:</p>
              <p className="font-medium">{entry.nutrition?.lastMeal} Uhr</p>
            </div>
            <div>
              <p className="text-gray-600">Proteinaufnahme:</p>
              <p className="font-medium">{entry.nutrition?.proteinIntake || 0} g</p>
            </div>
            {entry.nutrition?.cheatmeal && (
              <div>
                <p className="text-gray-600">Cheatmeal:</p>
                <p className="font-medium">{entry.nutrition.cheatmeal}</p>
              </div>
            )}
            {entry.nutrition?.alcohol && (
              <div>
                <p className="text-gray-600">Alkohol:</p>
                <p className="font-medium">Ja, um {entry.nutrition.alcoholTime} Uhr</p>
              </div>
            )}
          </div>
        </section>

        {/* Bedtime Routine */}
        <section className="card">
          <h2 className="text-lg font-semibold mb-3">Zu-Bett-Geh Routine</h2>
          <p className="font-medium">{getBedtimeRoutineText(entry.bedtimeRoutine || BedtimeRoutineStatus.SKIPPED)}</p>
        </section>

        {/* Energy & Mood */}
        <section className="card">
          <h2 className="text-lg font-semibold mb-3">Energie & Stimmung</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Energieniveau:</p>
              <p className="font-medium">{entry.energyLevel}/10</p>
            </div>
            <div>
              <p className="text-gray-600">Stimmung:</p>
              <p className="font-medium">{entry.mood}/10</p>
            </div>
          </div>
        </section>

        {/* Gratitude */}
        {entry.gratitude && (
          <section className="card">
            <h2 className="text-lg font-semibold mb-3">Dankbarkeit</h2>
            <p className="italic">"{entry.gratitude}"</p>
          </section>
        )}

        {/* Exercise */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Sport</h2>
          
          {entry.exercise.didExercise && entry.exercise.activities && entry.exercise.activities.length > 0 ? (
            <div className="space-y-4">
              {entry.exercise.activities.map((activity, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                  <h3 className="font-medium mb-2">Aktivität {index + 1}</h3>
                  <div className="space-y-2 pl-3">
                    <p><span className="font-medium">Art des Sports:</span> {activity.type}</p>
                    {activity.time && <p><span className="font-medium">Uhrzeit:</span> {activity.time}</p>}
                    <p><span className="font-medium">Dauer:</span> {activity.duration} Minuten</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Kein Sport an diesem Tag</p>
          )}
        </div>
        
        {/* Self Care */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Self Care</h2>
          
          <div className="space-y-4">
            {/* Sauna */}
            <div className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <h3 className="font-medium mb-2">Sauna</h3>
              {entry.selfCare?.sauna?.done ? (
                <div className="space-y-1 pl-3">
                  <p className="text-green-600">Ja</p>
                  {entry.selfCare.sauna.time && <p><span className="font-medium">Uhrzeit:</span> {entry.selfCare.sauna.time}</p>}
                  {entry.selfCare.sauna.duration && <p><span className="font-medium">Dauer:</span> {entry.selfCare.sauna.duration} Minuten</p>}
                </div>
              ) : (
                <p className="text-gray-500 pl-3">Nein</p>
              )}
            </div>
            
            {/* Ice Bath */}
            <div className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <h3 className="font-medium mb-2">Eisbad</h3>
              {entry.selfCare?.iceBath?.done ? (
                <div className="space-y-1 pl-3">
                  <p className="text-green-600">Ja</p>
                  {entry.selfCare.iceBath.time && <p><span className="font-medium">Uhrzeit:</span> {entry.selfCare.iceBath.time}</p>}
                  {entry.selfCare.iceBath.duration && <p><span className="font-medium">Dauer:</span> {entry.selfCare.iceBath.duration} Minuten</p>}
                </div>
              ) : (
                <p className="text-gray-500 pl-3">Nein</p>
              )}
            </div>
            
            {/* Stretching */}
            <div className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <h3 className="font-medium mb-2">Dehnen</h3>
              {entry.selfCare?.stretching?.done ? (
                <div className="space-y-1 pl-3">
                  <p className="text-green-600">Ja</p>
                  {entry.selfCare.stretching.time && <p><span className="font-medium">Uhrzeit:</span> {entry.selfCare.stretching.time}</p>}
                  {entry.selfCare.stretching.duration && <p><span className="font-medium">Dauer:</span> {entry.selfCare.stretching.duration} Minuten</p>}
                </div>
              ) : (
                <p className="text-gray-500 pl-3">Nein</p>
              )}
            </div>
            
            {/* Reading */}
            <div className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <h3 className="font-medium mb-2">Lesen</h3>
              {entry.selfCare?.reading?.done ? (
                <div className="space-y-1 pl-3">
                  <p className="text-green-600">Ja</p>
                  {entry.selfCare.reading.time && <p><span className="font-medium">Uhrzeit:</span> {entry.selfCare.reading.time}</p>}
                  {entry.selfCare.reading.duration && <p><span className="font-medium">Dauer:</span> {entry.selfCare.reading.duration} Minuten</p>}
                </div>
              ) : (
                <p className="text-gray-500 pl-3">Nein</p>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        {entry.comments && (
          <section className="card">
            <h2 className="text-lg font-semibold mb-3">Kommentare</h2>
            <p className="whitespace-pre-line">{entry.comments}</p>
          </section>
        )}
      </div>
    </div>
  );
}
