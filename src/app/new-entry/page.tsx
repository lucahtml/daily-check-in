'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormField from '@/components/FormField';
import Slider from '@/components/Slider';
import QuoteModal from '@/components/QuoteModal';
import { 
  DailyEntry, 
  SleepData, 
  ExerciseData, 
  ExerciseActivity,
  SelfCareData,
  SelfCareActivity,
  BedtimeRoutineStatus,
  saveEntry, 
  generateId, 
  getTodayFormatted,
  getEntryByDate,
  getEntries,
  getStreakInfo,
  updateStreakInfo
} from '@/lib/storage';
import { getRandomQuote } from '@/lib/quotes';

export default function NewEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteData, setQuoteData] = useState(getRandomQuote());
  const [streakCount, setStreakCount] = useState(0);
  const [isMonthlyCheckpoint, setIsMonthlyCheckpoint] = useState(false);
  
  // Form state
  const [date, setDate] = useState(searchParams?.get('date') || getTodayFormatted());
  const [totalSleep, setTotalSleep] = useState('');
  const [lightSleep, setLightSleep] = useState('');
  const [deepSleep, setDeepSleep] = useState('');
  const [remSleep, setRemSleep] = useState('');
  const [hrv, setHrv] = useState('');
  const [lastMeal, setLastMeal] = useState('');
  const [proteinIntake, setProteinIntake] = useState('');
  const [bedtimeRoutine, setBedtimeRoutine] = useState<BedtimeRoutineStatus>(BedtimeRoutineStatus.COMPLETED);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [mood, setMood] = useState(5);
  const [gratitude, setGratitude] = useState('');
  const [didExercise, setDidExercise] = useState(false);
  const [exerciseActivities, setExerciseActivities] = useState<ExerciseActivity[]>([{ type: '', duration: 0, time: '' }]);
  
  // Self Care
  const [sauna, setSauna] = useState<SelfCareActivity>({ done: false, time: '', duration: 0 });
  const [iceBath, setIceBath] = useState<SelfCareActivity>({ done: false, time: '', duration: 0 });
  const [stretching, setStretching] = useState<SelfCareActivity>({ done: false, time: '', duration: 0 });
  const [reading, setReading] = useState<SelfCareActivity>({ done: false, time: '', duration: 0 });
  const [comments, setComments] = useState('');
  
  // Load existing entry for today if it exists
  useEffect(() => {
    const loadTodayEntry = () => {
      const todayEntry = getEntryByDate(date);
      
      if (todayEntry) {
        // Populate form with existing data
        setTotalSleep(todayEntry.sleep.totalSleep.toString());
        setLightSleep(todayEntry.sleep.lightSleep.toString());
        setDeepSleep(todayEntry.sleep.deepSleep.toString());
        setRemSleep(todayEntry.sleep.remSleep.toString());
        setHrv(todayEntry.sleep.hrv.toString());
        setLastMeal(todayEntry.lastMeal);
        setProteinIntake(todayEntry.proteinIntake ? todayEntry.proteinIntake.toString() : '');
        setBedtimeRoutine(todayEntry.bedtimeRoutine || BedtimeRoutineStatus.COMPLETED);
        setEnergyLevel(todayEntry.energyLevel);
        setMood(todayEntry.mood);
        setGratitude(todayEntry.gratitude);
        setDidExercise(todayEntry.exercise.didExercise);
        
        // Exercise activities
        if (todayEntry.exercise.activities && todayEntry.exercise.activities.length > 0) {
          setExerciseActivities(todayEntry.exercise.activities);
        }
        
        // Self Care
        if (todayEntry.selfCare) {
          setSauna(todayEntry.selfCare.sauna);
          setIceBath(todayEntry.selfCare.iceBath);
          setStretching(todayEntry.selfCare.stretching);
          setReading(todayEntry.selfCare.reading);
        }
        
        setComments(todayEntry.comments);
      }
      
      setIsLoading(false);
    };
    
    loadTodayEntry();
  }, [date]);
  
  // Add exercise activity
  const addExerciseActivity = () => {
    setExerciseActivities([...exerciseActivities, { type: '', duration: 0, time: '' }]);
  };
  
  // Remove exercise activity
  const removeExerciseActivity = (index: number) => {
    setExerciseActivities(exerciseActivities.filter((_, i) => i !== index));
  };
  
  // Update exercise activity
  const updateExerciseActivity = (index: number, field: keyof ExerciseActivity, value: string | number) => {
    const updatedActivities = [...exerciseActivities];
    updatedActivities[index] = {
      ...updatedActivities[index],
      [field]: value
    };
    setExerciseActivities(updatedActivities);
  };
  
  // Update self care activity
  const updateSelfCareActivity = (
    activity: SelfCareActivity, 
    setter: React.Dispatch<React.SetStateAction<SelfCareActivity>>, 
    field: keyof SelfCareActivity, 
    value: boolean | string | number
  ) => {
    setter({
      ...activity,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Prepare sleep data
    const sleepData: SleepData = {
      totalSleep: parseInt(totalSleep) || 0,
      lightSleep: parseInt(lightSleep) || 0,
      deepSleep: parseInt(deepSleep) || 0,
      remSleep: parseInt(remSleep) || 0,
      hrv: parseInt(hrv) || 0
    };
    
    // Prepare exercise data
    const exerciseData: ExerciseData = {
      didExercise,
      activities: didExercise ? exerciseActivities.map(activity => ({
        type: activity.type,
        duration: typeof activity.duration === 'string' ? parseInt(activity.duration as string) || 0 : activity.duration,
        time: activity.time
      })) : []
    };
    
    // Prepare self care data
    const selfCareData: SelfCareData = {
      sauna,
      iceBath,
      stretching,
      reading
    };
    
    // Create entry object
    const entry: DailyEntry = {
      id: generateId(),
      date,
      sleep: sleepData,
      lastMeal,
      proteinIntake: parseInt(proteinIntake) || 0,
      bedtimeRoutine,
      energyLevel,
      mood,
      gratitude,
      exercise: exerciseData,
      selfCare: selfCareData,
      comments
    };
    
    // Check if entry for this date already exists
    const existingEntry = getEntryByDate(date);
    if (existingEntry) {
      entry.id = existingEntry.id;
    }
    
    // Save entry
    saveEntry(entry);
    
    // Update streak info and prepare reward
    const allEntries = getEntries();
    const streakInfo = updateStreakInfo(allEntries);
    setStreakCount(streakInfo.currentStreak);
    
    // Check if we've reached a monthly checkpoint
    const prevStreakInfo = getStreakInfo();
    setIsMonthlyCheckpoint(
      streakInfo.monthlyCheckpoints.length > prevStreakInfo.monthlyCheckpoints.length
    );
    
    // Show quote modal
    setQuoteData(getRandomQuote());
    setShowQuoteModal(true);
    
    // Redirect to home page after closing modal
    setIsSaving(false);
  };
  
  const handleCloseModal = () => {
    setShowQuoteModal(false);
    router.push('/');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Lade...</p>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Täglicher Check-In</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-xs">
            <FormField label="Datum" htmlFor="date">
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field text-center"
                required
              />
            </FormField>
          </div>
        </div>
        
        {/* Sleep Section */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Schlaf</h2>
          
          <FormField label="Gesamte Schlafzeit (Minuten)" htmlFor="totalSleep">
            <input
              type="number"
              id="totalSleep"
              value={totalSleep}
              onChange={(e) => setTotalSleep(e.target.value)}
              min="0"
              className="input-field"
              placeholder="Minuten"
              required
            />
          </FormField>
          
          <FormField label="Leichter Schlaf (Minuten)" htmlFor="lightSleep">
            <input
              type="number"
              id="lightSleep"
              value={lightSleep}
              onChange={(e) => setLightSleep(e.target.value)}
              min="0"
              className="input-field"
              placeholder="Minuten"
              required
            />
          </FormField>
          
          <FormField label="Tiefer Schlaf (Minuten)" htmlFor="deepSleep">
            <input
              type="number"
              id="deepSleep"
              value={deepSleep}
              onChange={(e) => setDeepSleep(e.target.value)}
              min="0"
              className="input-field"
              placeholder="Minuten"
              required
            />
          </FormField>
          
          <FormField label="REM-Schlaf (Minuten)" htmlFor="remSleep">
            <input
              type="number"
              id="remSleep"
              value={remSleep}
              onChange={(e) => setRemSleep(e.target.value)}
              min="0"
              className="input-field"
              placeholder="Minuten"
              required
            />
          </FormField>
          
          <FormField label="HRV (Millisekunden)" htmlFor="hrv">
            <input
              type="number"
              id="hrv"
              value={hrv}
              onChange={(e) => setHrv(e.target.value)}
              min="0"
              className="input-field"
              placeholder="ms"
              required
            />
          </FormField>
        </div>
        
        {/* Nutrition Section */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Ernährung</h2>
          
          <FormField label="Letzte Mahlzeit (Uhrzeit)" htmlFor="lastMeal">
            <input
              type="time"
              id="lastMeal"
              value={lastMeal}
              onChange={(e) => setLastMeal(e.target.value)}
              className="input-field time-input"
              required
            />
          </FormField>
          
          <FormField label="Proteinaufnahme (Gramm)" htmlFor="proteinIntake">
            <input
              type="number"
              id="proteinIntake"
              value={proteinIntake}
              onChange={(e) => setProteinIntake(e.target.value)}
              min="0"
              className="input-field"
              placeholder="Gramm"
              required
            />
          </FormField>
        </div>
        
        {/* Bedtime Routine */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Zu-Bett-Geh Routine</h2>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="bedtimeRoutine"
                checked={bedtimeRoutine === BedtimeRoutineStatus.COMPLETED}
                onChange={() => setBedtimeRoutine(BedtimeRoutineStatus.COMPLETED)}
                className="mr-2 h-4 w-4 text-primary"
              />
              <span>Vollständig eingehalten</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="bedtimeRoutine"
                checked={bedtimeRoutine === BedtimeRoutineStatus.PARTIAL}
                onChange={() => setBedtimeRoutine(BedtimeRoutineStatus.PARTIAL)}
                className="mr-2 h-4 w-4 text-primary"
              />
              <span>Teilweise eingehalten</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="bedtimeRoutine"
                checked={bedtimeRoutine === BedtimeRoutineStatus.SKIPPED}
                onChange={() => setBedtimeRoutine(BedtimeRoutineStatus.SKIPPED)}
                className="mr-2 h-4 w-4 text-primary"
              />
              <span>Nicht eingehalten</span>
            </label>
          </div>
        </div>
        
        {/* Energy and Mood */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Energie & Stimmung</h2>
          
          <FormField label="Energieniveau (1-10)" htmlFor="energyLevel">
            <Slider
              id="energyLevel"
              min={1}
              max={10}
              value={energyLevel}
              onChange={setEnergyLevel}
            />
          </FormField>
          
          <FormField label="Stimmung (1-10)" htmlFor="mood">
            <Slider
              id="mood"
              min={1}
              max={10}
              value={mood}
              onChange={setMood}
            />
          </FormField>
        </div>
        
        {/* Gratitude */}
        <FormField label="Wofür bist du heute dankbar?" htmlFor="gratitude">
          <input
            type="text"
            id="gratitude"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            className="input-field"
            placeholder="Ich bin dankbar für..."
          />
        </FormField>
        
        {/* Exercise */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Sport</h2>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={didExercise}
                onChange={(e) => setDidExercise(e.target.checked)}
                className="mr-2 h-4 w-4 text-primary"
              />
              <span>Ich habe heute Sport gemacht</span>
            </label>
          </div>
          
          {didExercise && (
            <div className="space-y-4">
              {exerciseActivities.map((activity, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Aktivität {index + 1}</h3>
                    {index > 0 && (
                      <button 
                        type="button" 
                        onClick={() => removeExerciseActivity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Entfernen
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <FormField label="Art des Sports" htmlFor={`exerciseType-${index}`}>
                      <input
                        type="text"
                        id={`exerciseType-${index}`}
                        value={activity.type}
                        onChange={(e) => updateExerciseActivity(index, 'type', e.target.value)}
                        className="input-field"
                        placeholder="z.B. Laufen, Yoga, Krafttraining"
                        required={didExercise}
                      />
                    </FormField>
                    
                    <FormField label="Uhrzeit" htmlFor={`exerciseTime-${index}`}>
                      <input
                        type="time"
                        id={`exerciseTime-${index}`}
                        value={activity.time || ''}
                        onChange={(e) => updateExerciseActivity(index, 'time', e.target.value)}
                        className="input-field time-input"
                        required={didExercise}
                      />
                    </FormField>
                    
                    <FormField label="Dauer (Minuten)" htmlFor={`exerciseDuration-${index}`}>
                      <input
                        type="number"
                        id={`exerciseDuration-${index}`}
                        value={typeof activity.duration === 'string' ? activity.duration : activity.duration.toString()}
                        onChange={(e) => updateExerciseActivity(index, 'duration', e.target.value)}
                        min="1"
                        className="input-field"
                        placeholder="Minuten"
                        required={didExercise}
                      />
                    </FormField>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addExerciseActivity}
                className="w-full py-2 border border-dashed border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
              >
                + Weitere Aktivität hinzufügen
              </button>
            </div>
          )}
        </div>
        
        {/* Self Care */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Self Care</h2>
          
          <div className="space-y-4">
            {/* Sauna */}
            <div className="p-4 border border-gray-200 rounded-md">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={sauna.done}
                  onChange={(e) => updateSelfCareActivity(sauna, setSauna, 'done', e.target.checked)}
                  className="mr-2 h-4 w-4 text-primary"
                />
                <span>Ich war in der Sauna</span>
              </label>
              
              {sauna.done && (
                <div className="space-y-3 pl-6">
                  <FormField label="Uhrzeit" htmlFor="saunaTime">
                    <input
                      type="time"
                      id="saunaTime"
                      value={sauna.time || ''}
                      onChange={(e) => updateSelfCareActivity(sauna, setSauna, 'time', e.target.value)}
                      className="input-field time-input"
                      required={sauna.done}
                    />
                  </FormField>
                  
                  <FormField label="Dauer (Minuten)" htmlFor="saunaDuration">
                    <input
                      type="number"
                      id="saunaDuration"
                      value={sauna.duration?.toString() || ''}
                      onChange={(e) => updateSelfCareActivity(sauna, setSauna, 'duration', e.target.value)}
                      min="1"
                      className="input-field"
                      placeholder="Minuten"
                      required={sauna.done}
                    />
                  </FormField>
                </div>
              )}
            </div>
            
            {/* Ice Bath */}
            <div className="p-4 border border-gray-200 rounded-md">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={iceBath.done}
                  onChange={(e) => updateSelfCareActivity(iceBath, setIceBath, 'done', e.target.checked)}
                  className="mr-2 h-4 w-4 text-primary"
                />
                <span>Ich habe ein Eisbad genommen</span>
              </label>
              
              {iceBath.done && (
                <div className="space-y-3 pl-6">
                  <FormField label="Uhrzeit" htmlFor="iceBathTime">
                    <input
                      type="time"
                      id="iceBathTime"
                      value={iceBath.time || ''}
                      onChange={(e) => updateSelfCareActivity(iceBath, setIceBath, 'time', e.target.value)}
                      className="input-field time-input"
                      required={iceBath.done}
                    />
                  </FormField>
                  
                  <FormField label="Dauer (Minuten)" htmlFor="iceBathDuration">
                    <input
                      type="number"
                      id="iceBathDuration"
                      value={iceBath.duration?.toString() || ''}
                      onChange={(e) => updateSelfCareActivity(iceBath, setIceBath, 'duration', e.target.value)}
                      min="1"
                      className="input-field"
                      placeholder="Minuten"
                      required={iceBath.done}
                    />
                  </FormField>
                </div>
              )}
            </div>
            
            {/* Stretching */}
            <div className="p-4 border border-gray-200 rounded-md">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={stretching.done}
                  onChange={(e) => updateSelfCareActivity(stretching, setStretching, 'done', e.target.checked)}
                  className="mr-2 h-4 w-4 text-primary"
                />
                <span>Ich habe mich gedehnt</span>
              </label>
              
              {stretching.done && (
                <div className="space-y-3 pl-6">
                  <FormField label="Uhrzeit" htmlFor="stretchingTime">
                    <input
                      type="time"
                      id="stretchingTime"
                      value={stretching.time || ''}
                      onChange={(e) => updateSelfCareActivity(stretching, setStretching, 'time', e.target.value)}
                      className="input-field time-input"
                      required={stretching.done}
                    />
                  </FormField>
                  
                  <FormField label="Dauer (Minuten)" htmlFor="stretchingDuration">
                    <input
                      type="number"
                      id="stretchingDuration"
                      value={stretching.duration?.toString() || ''}
                      onChange={(e) => updateSelfCareActivity(stretching, setStretching, 'duration', e.target.value)}
                      min="1"
                      className="input-field"
                      placeholder="Minuten"
                      required={stretching.done}
                    />
                  </FormField>
                </div>
              )}
            </div>
            
            {/* Reading */}
            <div className="p-4 border border-gray-200 rounded-md">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={reading.done}
                  onChange={(e) => updateSelfCareActivity(reading, setReading, 'done', e.target.checked)}
                  className="mr-2 h-4 w-4 text-primary"
                />
                <span>Ich habe gelesen</span>
              </label>
              
              {reading.done && (
                <div className="space-y-3 pl-6">
                  <FormField label="Uhrzeit" htmlFor="readingTime">
                    <input
                      type="time"
                      id="readingTime"
                      value={reading.time || ''}
                      onChange={(e) => updateSelfCareActivity(reading, setReading, 'time', e.target.value)}
                      className="input-field time-input"
                      required={reading.done}
                    />
                  </FormField>
                  
                  <FormField label="Dauer (Minuten)" htmlFor="readingDuration">
                    <input
                      type="number"
                      id="readingDuration"
                      value={reading.duration?.toString() || ''}
                      onChange={(e) => updateSelfCareActivity(reading, setReading, 'duration', e.target.value)}
                      min="1"
                      className="input-field"
                      placeholder="Minuten"
                      required={reading.done}
                    />
                  </FormField>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Comments */}
        <FormField label="Kommentare" htmlFor="comments">
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="input-field min-h-[100px]"
            placeholder="Weitere Notizen oder Gedanken..."
          />
        </FormField>
        
        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Speichern...
              </span>
            ) : (
              'Love Yourself'
            )}
          </button>
        </div>
        
        {/* Cancel Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            Abbrechen
          </button>
        </div>
      </form>
      
      {/* Quote Modal */}
      <QuoteModal
        quote={quoteData}
        isOpen={showQuoteModal}
        onClose={handleCloseModal}
        streak={streakCount}
        isMonthlyCheckpoint={isMonthlyCheckpoint}
      />
    </div>
  );
}
