export interface SleepData {
  totalSleep: number;
  lightSleep: number;
  deepSleep: number;
  remSleep: number;
  hrv: number;
}

export interface ExerciseActivity {
  type: string;
  duration: number;
  time?: string;
}

export interface ExerciseData {
  didExercise: boolean;
  activities: ExerciseActivity[];
}

export interface SelfCareActivity {
  done: boolean;
  time?: string;
  duration?: number;
}

export interface SelfCareData {
  sauna: SelfCareActivity;
  iceBath: SelfCareActivity;
  stretching: SelfCareActivity;
  reading: SelfCareActivity;
}

export enum BedtimeRoutineStatus {
  COMPLETED = "completed",
  PARTIAL = "partial",
  SKIPPED = "skipped"
}

export interface DailyEntry {
  id: string;
  date: string;
  sleep: SleepData;
  lastMeal: string;
  proteinIntake: number;
  bedtimeRoutine: BedtimeRoutineStatus;
  energyLevel: number;
  mood: number;
  gratitude: string;
  exercise: ExerciseData;
  selfCare: SelfCareData;
  comments: string;
}

const STORAGE_KEY = 'daily-check-in-entries';

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get all entries
export const getEntries = (): DailyEntry[] => {
  if (!isBrowser) return [];
  
  try {
    const storedEntries = localStorage.getItem(STORAGE_KEY);
    return storedEntries ? JSON.parse(storedEntries) : [];
  } catch (error) {
    console.error('Error retrieving entries:', error);
    return [];
  }
};

// Save an entry
export const saveEntry = (entry: DailyEntry): void => {
  if (!isBrowser) return;
  
  try {
    const entries = getEntries();
    const existingEntryIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      entries[existingEntryIndex] = entry;
    } else {
      // Add new entry
      entries.push(entry);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    updateStreakInfo(entries);
  } catch (error) {
    console.error('Error saving entry:', error);
  }
};

// Get a specific entry by date
export const getEntryByDate = (date: string): DailyEntry | undefined => {
  if (!isBrowser) return undefined;
  
  try {
    const entries = getEntries();
    return entries.find(entry => entry.date === date);
  } catch (error) {
    console.error('Error retrieving entry by date:', error);
    return undefined;
  }
};

// Delete an entry
export const deleteEntry = (id: string): void => {
  if (!isBrowser) return;
  
  try {
    const entries = getEntries();
    const updatedEntries = entries.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    updateStreakInfo(updatedEntries);
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
};

// Format a date string to YYYY-MM-DD
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get today's date in YYYY-MM-DD format
export const getTodayFormatted = (): string => {
  return formatDateForInput(new Date());
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Get streak information
export const getStreakInfo = (): { currentStreak: number, longestStreak: number, monthlyCheckpoints: number[] } => {
  if (!isBrowser) return { currentStreak: 0, longestStreak: 0, monthlyCheckpoints: [] };
  
  try {
    const storedInfo = localStorage.getItem('daily-check-in-streak');
    return storedInfo ? JSON.parse(storedInfo) : { currentStreak: 0, longestStreak: 0, monthlyCheckpoints: [] };
  } catch (error) {
    console.error('Error retrieving streak info:', error);
    return { currentStreak: 0, longestStreak: 0, monthlyCheckpoints: [] };
  }
};

// Update streak information
export const updateStreakInfo = (entries: DailyEntry[]): { currentStreak: number, longestStreak: number, monthlyCheckpoints: number[] } => {
  if (!isBrowser || entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0, monthlyCheckpoints: [] };
  }
  
  try {
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let streakDates: Date[] = [];
    let previousDate: Date | null = null;
    
    // Calculate current streak
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      if (previousDate === null) {
        // First entry
        if (entryDate.getTime() === today.getTime() || 
            entryDate.getTime() === today.getTime() - 86400000) {
          // If entry is today or yesterday, start streak
          currentStreak = 1;
          streakDates.push(entryDate);
          previousDate = entryDate;
        } else {
          // Entry is older than yesterday, no current streak
          break;
        }
      } else {
        // Check if this entry is consecutive with previous
        const expectedDate = new Date(previousDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
        
        if (entryDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
          streakDates.push(entryDate);
          previousDate = entryDate;
        } else {
          // Streak broken
          break;
        }
      }
    }
    
    // Get previous streak info
    const previousInfo = getStreakInfo();
    const longestStreak = Math.max(currentStreak, previousInfo.longestStreak);
    
    // Calculate monthly checkpoints
    const monthlyCheckpoints = calculateMonthlyCheckpoints(streakDates, previousInfo.monthlyCheckpoints);
    
    const streakInfo = { 
      currentStreak, 
      longestStreak,
      monthlyCheckpoints
    };
    
    // Save streak info
    localStorage.setItem('daily-check-in-streak', JSON.stringify(streakInfo));
    
    return streakInfo;
  } catch (error) {
    console.error('Error updating streak info:', error);
    return { currentStreak: 0, longestStreak: 0, monthlyCheckpoints: [] };
  }
};

// Calculate monthly checkpoints
const calculateMonthlyCheckpoints = (streakDates: Date[], existingCheckpoints: number[]): number[] => {
  const checkpoints = [...existingCheckpoints];
  
  if (streakDates.length === 0) return checkpoints;
  
  // Group dates by year-month
  const monthGroups: Record<string, Date[]> = {};
  
  streakDates.forEach(date => {
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthGroups[yearMonth]) {
      monthGroups[yearMonth] = [];
    }
    monthGroups[yearMonth].push(date);
  });
  
  // Check if any month has all days logged
  Object.entries(monthGroups).forEach(([yearMonth, dates]) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    if (dates.length === daysInMonth && !checkpoints.includes(dates.length)) {
      checkpoints.push(dates.length);
    }
  });
  
  return checkpoints.sort((a, b) => a - b);
};
