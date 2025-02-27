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
  const [quoteData, setQuoteData] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [isMonthlyCheckpoint, setIsMonthlyCheckpoint] = useState(false);
  
  // Form state
  const [date, setDate] = useState('');
  
  // Schlaf - Stunden und Minuten statt nur Minuten
  const [totalSleepHours, setTotalSleepHours] = useState('');
  const [totalSleepMinutes, setTotalSleepMinutes] = useState('');
  const [lightSleepHours, setLightSleepHours] = useState('');
  const [lightSleepMinutes, setLightSleepMinutes] = useState('');
  const [deepSleepHours, setDeepSleepHours] = useState('');
  const [deepSleepMinutes, setDeepSleepMinutes] = useState('');
  const [remSleepHours, setRemSleepHours] = useState('');
  const [remSleepMinutes, setRemSleepMinutes] = useState('');
  const [hrv, setHrv] = useState('');
  const [lastMeal, setLastMeal] = useState('');
  const [proteinIntake, setProteinIntake] = useState('');
  const [cheatmeal, setCheatmeal] = useState('');
  const [alcohol, setAlcohol] = useState(false);
  const [alcoholTime, setAlcoholTime] = useState('');
  const [bedtimeRoutine, setBedtimeRoutine] = useState<BedtimeRoutineStatus>(BedtimeRoutineStatus.COMPLETED);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [mood, setMood] = useState(5);
  const [gratitude, setGratitude] = useState('');
  const [didExercise, setDidExercise] = useState(false);
  const [exerciseActivities, setExerciseActivities] = useState<ExerciseActivity[]>([{ type: '', duration: 0, time: '' }]);
  
  // Self Care
  const defaultSelfCareActivity: SelfCareActivity = { done: false, time: '', duration: 0 };
  const [sauna, setSauna] = useState<SelfCareActivity>({ ...defaultSelfCareActivity });
  const [iceBath, setIceBath] = useState<SelfCareActivity>({ ...defaultSelfCareActivity });
  const [stretching, setStretching] = useState<SelfCareActivity>({ ...defaultSelfCareActivity });
  const [reading, setReading] = useState<SelfCareActivity>({ ...defaultSelfCareActivity });
  const [comments, setComments] = useState('');
  
  // Load existing entry for today if it exists
  useEffect(() => {
    const loadTodayEntry = () => {
      try {
        // Set initial date from searchParams or today's date
        const initialDate = searchParams?.get('date') || getTodayFormatted();
        setDate(initialDate);
        
        const todayEntry = getEntryByDate(initialDate);
        
        if (todayEntry) {
          // Populate form with existing data
          const totalSleep = todayEntry.sleep?.totalSleep || 0;
          const hours = Math.floor(totalSleep / 60);
          const minutes = totalSleep % 60;
          setTotalSleepHours(hours.toString());
          setTotalSleepMinutes(minutes.toString());
          
          const lightSleep = todayEntry.sleep?.lightSleep || 0;
          const lightHours = Math.floor(lightSleep / 60);
          const lightMinutes = lightSleep % 60;
          setLightSleepHours(lightHours.toString());
          setLightSleepMinutes(lightMinutes.toString());
          
          const deepSleep = todayEntry.sleep?.deepSleep || 0;
          const deepHours = Math.floor(deepSleep / 60);
          const deepMinutes = deepSleep % 60;
          setDeepSleepHours(deepHours.toString());
          setDeepSleepMinutes(deepMinutes.toString());
          
          const remSleep = todayEntry.sleep?.remSleep || 0;
          const remHours = Math.floor(remSleep / 60);
          const remMinutes = remSleep % 60;
          setRemSleepHours(remHours.toString());
          setRemSleepMinutes(remMinutes.toString());
          
          setHrv(todayEntry.sleep?.hrv?.toString() || '0');
          setLastMeal(todayEntry.nutrition?.lastMeal || '');
          setProteinIntake(todayEntry.nutrition?.proteinIntake?.toString() || '0');
          setCheatmeal(todayEntry.nutrition?.cheatmeal || '');
          setAlcohol(todayEntry.nutrition?.alcohol || false);
          setAlcoholTime(todayEntry.nutrition?.alcoholTime || '');
          setBedtimeRoutine(todayEntry.bedtimeRoutine || BedtimeRoutineStatus.COMPLETED);
          setEnergyLevel(todayEntry.energyLevel || 5);
          setMood(todayEntry.mood || 5);
          setGratitude(todayEntry.gratitude || '');
          setDidExercise(todayEntry.exercise?.didExercise || false);
          
          if (todayEntry.exercise?.activities && todayEntry.exercise.activities.length > 0) {
            setExerciseActivities(todayEntry.exercise.activities);
          }
          
          if (todayEntry.selfCare) {
            setSauna(todayEntry.selfCare.sauna || { ...defaultSelfCareActivity });
            setIceBath(todayEntry.selfCare.iceBath || { ...defaultSelfCareActivity });
            setStretching(todayEntry.selfCare.stretching || { ...defaultSelfCareActivity });
            setReading(todayEntry.selfCare.reading || { ...defaultSelfCareActivity });
          }
          
          setComments(todayEntry.comments || '');
        }
      } catch (error) {
        console.error('Error loading today entry:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTodayEntry();
  }, [searchParams]);
  
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
    
    try {
      console.log('Starting form submission...');
      
      if (!date) {
        throw new Error('Datum ist erforderlich');
      }
      
      // Prepare sleep data
      const totalSleep = parseInt(totalSleepHours || '0') * 60 + parseInt(totalSleepMinutes || '0');
      const lightSleep = parseInt(lightSleepHours || '0') * 60 + parseInt(lightSleepMinutes || '0');
      const deepSleep = parseInt(deepSleepHours || '0') * 60 + parseInt(deepSleepMinutes || '0');
      const remSleep = parseInt(remSleepHours || '0') * 60 + parseInt(remSleepMinutes || '0');
      
      console.log('Sleep data prepared:', { totalSleep, lightSleep, deepSleep, remSleep });
      
      const sleepData: SleepData = {
        totalSleep,
        lightSleep,
        deepSleep,
        remSleep,
        hrv: parseInt(hrv) || 0
      };
      
      // Prepare exercise data
      const exerciseData: ExerciseData = {
        didExercise,
        activities: didExercise ? exerciseActivities.filter(a => a.type.trim() !== '') : []
      };
      
      // Prepare self-care data
      const selfCareData: SelfCareData = {
        sauna: sauna || { done: false, time: '', duration: 0 },
        iceBath: iceBath || { done: false, time: '', duration: 0 },
        stretching: stretching || { done: false, time: '', duration: 0 },
        reading: reading || { done: false, time: '', duration: 0 }
      };
      
      // Prepare nutrition data
      const nutritionData = {
        lastMeal: lastMeal || '',
        proteinIntake: parseInt(proteinIntake) || 0,
        cheatmeal: cheatmeal || '',
        alcohol: alcohol || false,
        alcoholTime: alcohol && alcoholTime ? alcoholTime : ''
      };
      
      console.log('All data prepared, creating entry object...');
      
      // Create or update entry
      const newId = generateId();
      console.log('Generated ID:', newId);
      
      const entry: DailyEntry = {
        id: newId,
        date,
        sleep: sleepData,
        nutrition: nutritionData,
        bedtimeRoutine: bedtimeRoutine || BedtimeRoutineStatus.COMPLETED,
        energyLevel: energyLevel || 5,
        mood: mood || 5,
        gratitude: gratitude || '',
        exercise: exerciseData,
        selfCare: selfCareData,
        comments: comments || ''
      };
      
      // Check if entry for this date already exists
      const existingEntry = getEntryByDate(date);
      if (existingEntry) {
        console.log('Updating existing entry with ID:', existingEntry.id);
        entry.id = existingEntry.id;
      } else {
        console.log('Creating new entry with ID:', entry.id);
      }
      
      console.log('Saving entry...');
      
      // Save entry
      saveEntry(entry);
      
      console.log('Entry saved successfully!');
      
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
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Es ist ein Fehler beim Speichern des Eintrags aufgetreten. Bitte versuche es erneut.');
      setIsSaving(false);
    }
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
        
        {/* Energy and Mood */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Wie war dein Tag?</h2>
          
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
        
        {/* Exercise */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Hast du heute Sport gemacht?</h2>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="didExercise"
              checked={didExercise}
              onChange={(e) => setDidExercise(e.target.checked)}
              className="mr-2 h-4 w-4 text-primary"
            />
            <label htmlFor="didExercise">Ja, ich habe heute trainiert</label>
          </div>
          
          {didExercise && (
            <div className="mt-4 space-y-4">
              {exerciseActivities.map((activity, index) => (
                <div key={index} className="border-t pt-4">
                  <FormField label="Trainingsart" htmlFor={`exerciseType-${index}`}>
                    <input
                      type="text"
                      id={`exerciseType-${index}`}
                      value={activity.type}
                      onChange={(e) => updateExerciseActivity(index, 'type', e.target.value)}
                      className="input-field"
                      placeholder="z.B. Laufen, Krafttraining, Yoga"
                      required={didExercise}
                    />
                  </FormField>
                  
                  <FormField label="Dauer (Minuten)" htmlFor={`exerciseDuration-${index}`}>
                    <input
                      type="number"
                      id={`exerciseDuration-${index}`}
                      value={activity.duration}
                      onChange={(e) => updateExerciseActivity(index, 'duration', parseInt(e.target.value) || 0)}
                      min="0"
                      className="input-field"
                      placeholder="Minuten"
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
                    />
                  </FormField>
                  
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeExerciseActivity(index)}
                      className="text-red-500 mt-2"
                    >
                      Aktivität entfernen
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addExerciseActivity}
                className="btn-secondary w-full mt-4"
              >
                + Weitere Trainingseinheit hinzufügen
              </button>
            </div>
          )}
        </div>
        
        {/* Self Care */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Hast du es dir heute gut gehen lassen?</h2>
          
          <div className="space-y-4">
            {Object.entries(selfCareActivities).map(([key, activity]) => {
              const label = getSelfCareLabel(key as keyof SelfCareData);
              return (
                <div key={key} className="border-t pt-4 first:border-t-0 first:pt-0">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`selfCare-${key}`}
                      checked={activity.done}
                      onChange={(e) => updateSelfCareActivity(activity, activity === sauna ? setSauna : activity === iceBath ? setIceBath : activity === stretching ? setStretching : setReading, 'done', e.target.checked)}
                      className="mr-2 h-4 w-4 text-primary"
                    />
                    <label htmlFor={`selfCare-${key}`}>{label}</label>
                  </div>
                  
                  {activity.done && (
                    <div className="ml-6 space-y-2">
                      <FormField label="Dauer (Minuten)" htmlFor={`selfCareDuration-${key}`}>
                        <input
                          type="number"
                          id={`selfCareDuration-${key}`}
                          value={activity.duration || ''}
                          onChange={(e) => updateSelfCareActivity(activity, activity === sauna ? setSauna : activity === iceBath ? setIceBath : activity === stretching ? setStretching : setReading, 'duration', e.target.value ? parseInt(e.target.value) : undefined)}
                          min="0"
                          className="input-field"
                          placeholder="Minuten"
                        />
                      </FormField>
                      
                      <FormField label="Uhrzeit" htmlFor={`selfCareTime-${key}`}>
                        <input
                          type="time"
                          id={`selfCareTime-${key}`}
                          value={activity.time || ''}
                          onChange={(e) => updateSelfCareActivity(activity, activity === sauna ? setSauna : activity === iceBath ? setIceBath : activity === stretching ? setStretching : setReading, 'time', e.target.value)}
                          className="input-field time-input"
                        />
                      </FormField>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Nutrition */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Was hast du heute gegessen?</h2>
          
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
          
          <FormField label="Proteinaufnahme (g)" htmlFor="proteinIntake">
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
          
          <FormField label="Cheatmeal" htmlFor="cheatmeal">
            <input
              type="text"
              id="cheatmeal"
              value={cheatmeal}
              onChange={(e) => setCheatmeal(e.target.value)}
              className="input-field"
              placeholder="Cheatmeal"
            />
          </FormField>
          
          <FormField label="Alkohol" htmlFor="alcohol">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alcohol"
                checked={alcohol}
                onChange={(e) => setAlcohol(e.target.checked)}
                className="mr-2 h-4 w-4 text-primary"
              />
              <span>Ich habe Alkohol getrunken</span>
            </div>
          </FormField>
          
          {alcohol && (
            <FormField label="Uhrzeit des Alkoholkonsums" htmlFor="alcoholTime">
              <input
                type="time"
                id="alcoholTime"
                value={alcoholTime}
                onChange={(e) => setAlcoholTime(e.target.value)}
                className="input-field time-input"
              />
            </FormField>
          )}
        </div>
        
        {/* Sleep Section */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Schlaf</h2>
          
          <FormField label="Gesamte Schlafzeit" htmlFor="totalSleep">
            <div className="flex space-x-2">
              <input
                type="number"
                id="totalSleepHours"
                value={totalSleepHours}
                onChange={(e) => setTotalSleepHours(e.target.value)}
                min="0"
                className="input-field w-16"
                placeholder="Std."
                required
              />
              <input
                type="number"
                id="totalSleepMinutes"
                value={totalSleepMinutes}
                onChange={(e) => setTotalSleepMinutes(e.target.value)}
                min="0"
                max="59"
                className="input-field w-16"
                placeholder="Min."
                required
              />
            </div>
          </FormField>
          
          <FormField label="Leichter Schlaf" htmlFor="lightSleep">
            <div className="flex space-x-2">
              <input
                type="number"
                id="lightSleepHours"
                value={lightSleepHours}
                onChange={(e) => setLightSleepHours(e.target.value)}
                min="0"
                className="input-field w-16"
                placeholder="Std."
                required
              />
              <input
                type="number"
                id="lightSleepMinutes"
                value={lightSleepMinutes}
                onChange={(e) => setLightSleepMinutes(e.target.value)}
                min="0"
                max="59"
                className="input-field w-16"
                placeholder="Min."
                required
              />
            </div>
          </FormField>
          
          <FormField label="Tiefer Schlaf" htmlFor="deepSleep">
            <div className="flex space-x-2">
              <input
                type="number"
                id="deepSleepHours"
                value={deepSleepHours}
                onChange={(e) => setDeepSleepHours(e.target.value)}
                min="0"
                className="input-field w-16"
                placeholder="Std."
                required
              />
              <input
                type="number"
                id="deepSleepMinutes"
                value={deepSleepMinutes}
                onChange={(e) => setDeepSleepMinutes(e.target.value)}
                min="0"
                max="59"
                className="input-field w-16"
                placeholder="Min."
                required
              />
            </div>
          </FormField>
          
          <FormField label="REM-Schlaf" htmlFor="remSleep">
            <div className="flex space-x-2">
              <input
                type="number"
                id="remSleepHours"
                value={remSleepHours}
                onChange={(e) => setRemSleepHours(e.target.value)}
                min="0"
                className="input-field w-16"
                placeholder="Std."
                required
              />
              <input
                type="number"
                id="remSleepMinutes"
                value={remSleepMinutes}
                onChange={(e) => setRemSleepMinutes(e.target.value)}
                min="0"
                max="59"
                className="input-field w-16"
                placeholder="Min."
                required
              />
            </div>
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
        
        {/* Bedtime Routine */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Zu-Bett-Geh-Routine</h2>
          
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
        
        {/* Gratitude */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Wofür bist du heute dankbar?</h2>
          
          <textarea
            id="gratitude"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            className="input-field h-24 resize-none"
            placeholder="Schreibe hier, wofür du heute dankbar bist..."
            required
          />
        </div>
        
        {/* Comments */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Kommentare</h2>
          
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="input-field h-24 resize-none"
            placeholder="Zusätzliche Notizen oder Gedanken..."
          />
        </div>
        
        <div className="flex justify-center mt-8">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Speichern...' : 'Speichern'}
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
