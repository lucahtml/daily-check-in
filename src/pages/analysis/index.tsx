import { useEffect, useState } from 'react';
import { getEntries, DailyEntry } from '@/lib/storage';

export default function AnalysisPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageEnergy, setAverageEnergy] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [exerciseDays, setExerciseDays] = useState(0);
  const [averageSleep, setAverageSleep] = useState(0);

  useEffect(() => {
    const loadData = () => {
      const allEntries = getEntries();
      
      // Sort entries by date (newest first)
      const sortedEntries = allEntries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setEntries(sortedEntries);
      
      // Calculate statistics
      if (allEntries.length > 0) {
        // Average energy
        const totalEnergy = allEntries.reduce((sum, entry) => sum + (entry.energyLevel || 0), 0);
        setAverageEnergy(Math.round((totalEnergy / allEntries.length) * 10) / 10);
        
        // Average mood
        const totalMood = allEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0);
        setAverageMood(Math.round((totalMood / allEntries.length) * 10) / 10);
        
        // Exercise days
        const exerciseDaysCount = allEntries.filter(entry => 
          entry.exercise && entry.exercise.didExercise
        ).length;
        setExerciseDays(exerciseDaysCount);
        
        // Average sleep
        const totalSleep = allEntries.reduce((sum, entry) => 
          sum + (entry.sleep && entry.sleep.totalSleep ? entry.sleep.totalSleep : 0), 0
        );
        setAverageSleep(Math.round((totalSleep / allEntries.length) / 60 * 10) / 10); // Convert to hours
      }
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold text-primary">Analyse</h1>
        <p className="text-gray-600">Übersicht deiner Gesundheit und deines Wohlbefindens</p>
      </header>

      {loading ? (
        <div className="text-center py-8">
          <p>Daten werden geladen...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 card">
          <p className="text-gray-500">Noch keine Einträge vorhanden.</p>
          <p className="mt-2">
            <a href="/new-entry/" className="text-primary hover:underline">
              Erstelle deinen ersten Eintrag
            </a>
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Zusammenfassung</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600">Durchschnittliche Energie</p>
                <p className="text-2xl font-bold text-blue-600">{averageEnergy}/10</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600">Durchschnittliche Stimmung</p>
                <p className="text-2xl font-bold text-green-600">{averageMood}/10</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-600">Trainingstage</p>
                <p className="text-2xl font-bold text-purple-600">{exerciseDays} von {entries.length}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-gray-600">Durchschnittlicher Schlaf</p>
                <p className="text-2xl font-bold text-indigo-600">{averageSleep} Std</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Einträge</h2>
            <p className="text-gray-600 mb-2">Du hast insgesamt {entries.length} Einträge erstellt.</p>
            <div className="space-y-2">
              {entries.slice(0, 5).map(entry => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{new Date(entry.date).toLocaleDateString('de-DE')}</p>
                  <div className="flex space-x-4 text-sm mt-1">
                    <p>Energie: {entry.energyLevel}/10</p>
                    <p>Stimmung: {entry.mood}/10</p>
                  </div>
                </div>
              ))}
              {entries.length > 5 && (
                <p className="text-center text-gray-500 text-sm">
                  + {entries.length - 5} weitere Einträge
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
