import React from 'react';
import Link from 'next/link';
import { DailyEntry, BedtimeRoutineStatus } from '@/lib/storage';

interface EntryCardProps {
  entry: DailyEntry;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
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
        return 'Vollständig';
      case BedtimeRoutineStatus.PARTIAL:
        return 'Teilweise';
      case BedtimeRoutineStatus.SKIPPED:
        return 'Übersprungen';
      default:
        return 'Unbekannt';
    }
  };

  // Format exercise duration
  const getExerciseDuration = (entry: DailyEntry) => {
    if (!entry.exercise?.didExercise || !entry.exercise.activities || entry.exercise.activities.length === 0) {
      return 'Nein';
    }
    const totalDuration = entry.exercise.activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
    return `${totalDuration} Minuten`;
  };

  return (
    <Link href={`/entry/${entry.id}`} className="block no-underline">
      <div className="card hover:shadow-lg transition-shadow mb-4">
        <h3 className="text-lg font-semibold mb-2">{formatDate(entry.date)}</h3>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Energie:</p>
            <p className="font-medium">{entry.energyLevel || 0}/10</p>
          </div>
          <div>
            <p className="text-gray-600">Stimmung:</p>
            <p className="font-medium">{entry.mood || 0}/10</p>
          </div>
          <div>
            <p className="text-gray-600">Schlaf:</p>
            <p className="font-medium">{entry.sleep?.totalSleep || 0} min</p>
          </div>
          <div>
            <p className="text-gray-600">Sport:</p>
            <p className="font-medium">{getExerciseDuration(entry)}</p>
          </div>
          <div>
            <p className="text-gray-600">Protein:</p>
            <p className="font-medium">{entry.nutrition?.proteinIntake || 0} g</p>
          </div>
          <div>
            <p className="text-gray-600">Abendroutine:</p>
            <p className="font-medium">{getBedtimeRoutineText(entry.bedtimeRoutine || BedtimeRoutineStatus.SKIPPED)}</p>
          </div>
        </div>
        
        {/* Self Care Summary */}
        {entry.selfCare && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-gray-600 text-sm mb-1">Selbstfürsorge:</p>
            <div className="flex flex-wrap gap-2">
              {entry.selfCare.sauna?.done && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Sauna</span>
              )}
              {entry.selfCare.iceBath?.done && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Eisbad</span>
              )}
              {entry.selfCare.stretching?.done && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Dehnen</span>
              )}
              {entry.selfCare.reading?.done && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Lesen</span>
              )}
              {(!entry.selfCare.sauna?.done && !entry.selfCare.iceBath?.done && 
                !entry.selfCare.stretching?.done && !entry.selfCare.reading?.done) && (
                <span className="text-gray-500 text-xs">Keine Selbstfürsorge-Aktivitäten</span>
              )}
            </div>
          </div>
        )}
        
        {entry.gratitude && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-gray-600 text-sm">Dankbarkeit:</p>
            <p className="text-sm italic">"{entry.gratitude}"</p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default EntryCard;