'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEntries, DailyEntry, getTodayFormatted, getEntryByDate, getStreakInfo, updateStreakInfo } from '@/lib/storage';
import EntryCard from '@/components/EntryCard';
import StreakDisplay from '@/components/StreakDisplay';

export default function Home() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [streakInfo, setStreakInfo] = useState({
    currentStreak: 0,
    longestStreak: 0,
    monthlyCheckpoints: [] as number[]
  });

  useEffect(() => {
    // Load entries from localStorage
    const loadEntries = () => {
      const allEntries = getEntries();
      const today = getTodayFormatted();
      const todayEntry = getEntryByDate(today);
      
      // Sort entries by date (newest first)
      const sortedEntries = allEntries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Update streak info
      const streak = updateStreakInfo(allEntries);
      
      setEntries(sortedEntries);
      setTodayEntry(todayEntry);
      setStreakInfo(streak);
      setIsLoading(false);
    };
    
    loadEntries();
  }, []);

  return (
    <div className="space-y-6">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold text-primary">Daily Check In</h1>
        <p className="text-gray-600">Verfolge deine tägliche Gesundheit und Wohlbefinden</p>
      </header>

      {!isLoading && streakInfo.currentStreak > 0 && (
        <StreakDisplay 
          currentStreak={streakInfo.currentStreak}
          longestStreak={streakInfo.longestStreak}
          monthlyCheckpoints={streakInfo.monthlyCheckpoints}
        />
      )}

      <div className="flex justify-center">
        <Link 
          href="/new-entry" 
          className="btn-primary w-full max-w-xs flex items-center justify-center"
        >
          {todayEntry ? 'Heutigen Eintrag bearbeiten' : 'Neuen Eintrag erstellen'}
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Deine Einträge</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p>Lade Einträge...</p>
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 card">
            <p className="text-gray-500">Noch keine Einträge vorhanden.</p>
            <p className="mt-2">
              <Link href="/new-entry" className="text-primary hover:underline">
                Erstelle deinen ersten Eintrag
              </Link>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
