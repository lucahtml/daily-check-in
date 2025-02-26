import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getEntryById, DailyEntry } from '@/lib/storage';
import Link from 'next/link';

export default function EntryDetail() {
  const router = useRouter();
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get the ID from the URL path directly
      const pathParts = window.location.pathname.split('/');
      const id = pathParts[pathParts.length - 2]; // Get the ID from the path
      
      if (id) {
        const entryData = getEntryById(id);
        setEntry(entryData || null);
      }
      setLoading(false);
    }
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
            <p className="font-medium">{entry.sleep.total} Stunden</p>
          </div>
          <div>
            <p className="text-gray-500">Light Sleep</p>
            <p className="font-medium">{entry.sleep.light} Stunden</p>
          </div>
          <div>
            <p className="text-gray-500">Deep Sleep</p>
            <p className="font-medium">{entry.sleep.deep} Stunden</p>
          </div>
          <div>
            <p className="text-gray-500">REM Sleep</p>
            <p className="font-medium">{entry.sleep.rem} Stunden</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Wellbeing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Energy</p>
            <p className="font-medium">{entry.wellbeing.energy}/10</p>
          </div>
          <div>
            <p className="text-gray-500">Mood</p>
            <p className="font-medium">{entry.wellbeing.mood}/10</p>
          </div>
          <div>
            <p className="text-gray-500">Stress</p>
            <p className="font-medium">{entry.wellbeing.stress}/10</p>
          </div>
          <div>
            <p className="text-gray-500">Focus</p>
            <p className="font-medium">{entry.wellbeing.focus}/10</p>
          </div>
        </div>
      </div>

      {entry.exercise && entry.exercise.activities && entry.exercise.activities.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Exercise</h2>
          <div className="space-y-4">
            {entry.exercise.activities.map((activity, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{activity.type}</p>
                <p className="text-gray-500">{activity.duration} minutes</p>
                {activity.intensity && <p className="text-gray-500">Intensity: {activity.intensity}/10</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.selfCare && entry.selfCare.activities && entry.selfCare.activities.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Self Care</h2>
          <div className="space-y-4">
            {entry.selfCare.activities.map((activity, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{activity.type}</p>
                <p className="text-gray-500">{activity.duration} minutes</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.notes && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <p className="whitespace-pre-wrap">{entry.notes}</p>
        </div>
      )}

      <div className="flex justify-center space-x-4 pt-4">
        <Link href="/" className="btn-secondary">
          Back to overview
        </Link>
        <Link href={`/new-entry?date=${entry.date}`} className="btn-primary">
          Edit
        </Link>
      </div>
    </div>
  );
}
