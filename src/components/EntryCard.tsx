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
    <Link href={`