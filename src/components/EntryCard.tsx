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
    return new Intl.DateTimeFormat('en-US', {
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
    <Link href={`/entry/${entry.id}/`} className="block no-underline">
      <div className="card hover:shadow-lg transition-shadow mb-4">
        <h3 className="text-lg font-semibold mb-2">{formatDate(entry.date)}</h3>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Energy:</p>
            <p className="font-medium">{entry.energyLevel}/10</p>
          </div>
          <div>
            <p className="text-gray-600">Mood:</p>
            <p className="font-medium">{entry.mood}/10</p>
          </div>
          <div>
            <p className="text-gray-600">Sleep:</p>
            <p className="font-medium">{entry.sleep.totalSleep} min</p>
          </div>
          <div>
            <p className="text-gray-600">Exercise:</p>
            <p className="font-medium">
              {entry.exercise.didExercise && entry.exercise.activities && entry.exercise.activities.length > 0 
                ? `${entry.exercise.activities.length} activity${entry.exercise.activities.length > 1 ? 'ies' : 'y'}`
                : 'No'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Protein:</p>
            <p className="font-medium">{entry.proteinIntake || 0} g</p>
          </div>
          <div>
            <p className="text-gray-600">Bedtime routine:</p>
            <p className="font-medium">{getBedtimeRoutineText(entry.bedtimeRoutine || BedtimeRoutineStatus.SKIPPED)}</p>
          </div>
        </div>
        
        {/* Self Care Summary */}
        {entry.selfCare && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-gray-600 text-sm mb-1">Self Care:</p>
            <div className="flex flex-wrap gap-2">
              {entry.selfCare.sauna?.done && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Sauna</span>
              )}
              {entry.selfCare.iceBath?.done && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Ice Bath</span>
              )}
              {entry.selfCare.stretching?.done && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Stretching</span>
              )}
              {entry.selfCare.reading?.done && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Reading</span>
              )}
              {(!entry.selfCare.sauna?.done && !entry.selfCare.iceBath?.done && 
                !entry.selfCare.stretching?.done && !entry.selfCare.reading?.done) && (
                <span className="text-gray-500 text-xs">No self-care activities</span>
              )}
            </div>
          </div>
        )}
        
        {entry.gratitude && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-gray-600 text-sm">Gratitude:</p>
            <p className="text-sm italic">"{entry.gratitude}"</p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default EntryCard;
