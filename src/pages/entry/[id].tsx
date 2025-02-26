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
          const id = pathParts[pathParts.length - 2]; // Get the ID from the path
          
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
        <p>Loading entry...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-8 card">
        <h2 className="text-xl font-semibold mb-4">Entry not found</h2>
        <p className="text-gray-500 mb-4">The entry you're looking for doesn't exist or has been deleted.</p>
        <Link href="/" className="btn-primary">
          Back to overview
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Helper function to get bedtime routine text
  const getBedtimeRoutineText = (status: BedtimeRoutineStatus) => {
    switch (status) {
      case BedtimeRoutineStatus.COMPLETED:
        return 'Complete';
      case BedtimeRoutineStatus.PARTIAL:
        return 'Partial';
      case BedtimeRoutineStatus.SKIPPED:
        return 'Skipped';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold text-primary">Entry Details</h1>
        <p className="text-gray-600">{formatDate(entry.date)}</p>
      </header>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Sleep</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Total Sleep</p>
            <p className="font-medium">{entry.sleep.totalSleep} min</p>
          </div>
          <div>
            <p className="text-gray-500">Light Sleep</p>
            <p className="font-medium">{entry.sleep.lightSleep} min</p>
          </div>
          <div>
            <p className="text-gray-500">Deep Sleep</p>
            <p className="font-medium">{entry.sleep.deepSleep} min</p>
          </div>
          <div>
            <p className="text-gray-500">REM Sleep</p>
            <p className="font-medium">{entry.sleep.remSleep} min</p>
          </div>
          {entry.sleep.hrv && (
            <div>
              <p className="text-gray-500">HRV</p>
              <p className="font-medium">{entry.sleep.hrv}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Wellbeing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Energy</p>
            <p className="font-medium">{entry.energyLevel}/10</p>
          </div>
          <div>
            <p className="text-gray-500">Mood</p>
            <p className="font-medium">{entry.mood}/10</p>
          </div>
          <div>
            <p className="text-gray-500">Protein Intake</p>
            <p className="font-medium">{entry.proteinIntake || 0} g</p>
          </div>
          <div>
            <p className="text-gray-500">Bedtime Routine</p>
            <p className="font-medium">{getBedtimeRoutineText(entry.bedtimeRoutine || BedtimeRoutineStatus.SKIPPED)}</p>
          </div>
        </div>
      </div>

      {entry.exercise && entry.exercise.didExercise && entry.exercise.activities && entry.exercise.activities.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Exercise</h2>
          <div className="space-y-4">
            {entry.exercise.activities.map((activity, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{activity.type}</p>
                <p className="text-gray-500">{activity.duration} minutes</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.selfCare && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Self Care</h2>
          <div className="space-y-4">
            {entry.selfCare.sauna?.done && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Sauna</p>
                {entry.selfCare.sauna.duration && (
                  <p className="text-gray-500">{entry.selfCare.sauna.duration} minutes</p>
                )}
              </div>
            )}
            {entry.selfCare.iceBath?.done && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Ice Bath</p>
                {entry.selfCare.iceBath.duration && (
                  <p className="text-gray-500">{entry.selfCare.iceBath.duration} minutes</p>
                )}
              </div>
            )}
            {entry.selfCare.stretching?.done && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Stretching</p>
                {entry.selfCare.stretching.duration && (
                  <p className="text-gray-500">{entry.selfCare.stretching.duration} minutes</p>
                )}
              </div>
            )}
            {entry.selfCare.reading?.done && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Reading</p>
                {entry.selfCare.reading.duration && (
                  <p className="text-gray-500">{entry.selfCare.reading.duration} minutes</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {entry.gratitude && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Gratitude</h2>
          <p className="whitespace-pre-wrap">"{entry.gratitude}"</p>
        </div>
      )}

      {entry.comments && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <p className="whitespace-pre-wrap">{entry.comments}</p>
        </div>
      )}

      <div className="flex justify-center space-x-4 pt-4 pb-16">
        <Link href="/" className="btn-secondary">
          Back to overview
        </Link>
        <Link href={`/new-entry/?date=${entry.date}`} className="btn-primary">
          Edit
        </Link>
      </div>
    </div>
  );
}
