import { DailyEntry, BedtimeRoutineStatus } from './storage';

// Typen für Analyseberichte
export interface AnalysisReport {
  trends: TrendAnalysis[];
  patterns: PatternAnalysis[];
  insights: Insight[];
}

export interface TrendAnalysis {
  metric: string;
  description: string;
  trend: 'improving' | 'declining' | 'stable';
  data: number[];
  dates: string[];
}

export interface PatternAnalysis {
  title: string;
  description: string;
  confidence: number; // 0-1
  relatedMetrics: string[];
}

export interface Insight {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  recommendation: string;
}

// Hauptanalysefunktion
export function analyzeEntries(entries: DailyEntry[]): AnalysisReport {
  if (!entries || entries.length === 0) {
    return { trends: [], patterns: [], insights: [] };
  }

  // Sortiere Einträge nach Datum (älteste zuerst)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Sammle alle Muster
  const allPatterns = [
    ...analyzePatterns(sortedEntries),
    ...analyzeWeekdays(sortedEntries),
    ...analyzeSequentialPatterns(sortedEntries),
    ...analyzeSaunaHRVCorrelation(sortedEntries),
    ...analyzeIceBathHRVCorrelation(sortedEntries),
    ...analyzeExerciseHRVCorrelation(sortedEntries),
    ...analyzeSleepHRVCorrelation(sortedEntries)
  ];

  return {
    trends: analyzeTrends(sortedEntries),
    patterns: allPatterns,
    insights: generateInsights(sortedEntries)
  };
}

// Hilfsfunktion für sichere Zahlenkonvertierung
function safeNumber(value: number | undefined): number {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
}

// Hilfsfunktion für sichere Schlafqualitätsberechnung
function calculateSleepQuality(entry: DailyEntry): number {
  if (!entry.sleep?.totalSleep || !entry.sleep?.deepSleep) return 0;
  const totalSleep = safeNumber(entry.sleep.totalSleep);
  const deepSleep = safeNumber(entry.sleep.deepSleep);
  return totalSleep > 0 ? (deepSleep / totalSleep) * 100 : 0;
}

// Hilfsfunktion für sichere Sportaktivitätsprüfung
function hasExercise(entry: DailyEntry): boolean {
  return entry.exercise?.didExercise === true;
}

// Trendanalyse für verschiedene Metriken
function analyzeTrends(entries: DailyEntry[]): TrendAnalysis[] {
  const trends: TrendAnalysis[] = [];
  
  if (entries.length < 3) return trends;

  // Energielevel-Trend
  const energyData = entries.map(entry => safeNumber(entry.energyLevel));
  const energyDates = entries.map(entry => entry.date);
  trends.push({
    metric: 'Energielevel',
    description: getTrendDescription(energyData, 'Energielevel'),
    trend: determineTrend(energyData),
    data: energyData,
    dates: energyDates
  });

  // Stimmungs-Trend
  const moodData = entries.map(entry => safeNumber(entry.mood));
  const moodDates = entries.map(entry => entry.date);
  trends.push({
    metric: 'Stimmung',
    description: getTrendDescription(moodData, 'Stimmung'),
    trend: determineTrend(moodData),
    data: moodData,
    dates: moodDates
  });

  // Schlafqualität-Trend
  const sleepQualityData = entries.map(entry => calculateSleepQuality(entry));
  const sleepDates = entries.map(entry => entry.date);
  trends.push({
    metric: 'Schlafqualität',
    description: getTrendDescription(sleepQualityData, 'Schlafqualität (% Tiefschlaf)'),
    trend: determineTrend(sleepQualityData),
    data: sleepQualityData,
    dates: sleepDates
  });

  // HRV-Trend
  const hrvData = entries.map(entry => safeNumber(entry.sleep?.hrv));
  const hrvDates = entries.map(entry => entry.date);
  trends.push({
    metric: 'HRV',
    description: getTrendDescription(hrvData, 'Herzratenvariabilität'),
    trend: determineTrend(hrvData),
    data: hrvData,
    dates: hrvDates
  });

  return trends;
}

// Bestimme den Trend einer Datenreihe
function determineTrend(data: number[]): 'improving' | 'declining' | 'stable' {
  if (data.length < 3) return 'stable';
  
  // Einfache lineare Regression
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = data.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Bestimme Trend basierend auf der Steigung
  if (Math.abs(slope) < 0.1) return 'stable';
  return slope > 0 ? 'improving' : 'declining';
}

// Erstelle eine Beschreibung des Trends
function getTrendDescription(data: number[], metricName: string): string {
  const trend = determineTrend(data);
  const recentAvg = data.slice(-3).reduce((sum, val) => sum + val, 0) / Math.min(data.length, 3);
  const oldAvg = data.slice(0, 3).reduce((sum, val) => sum + val, 0) / Math.min(data.length, 3);
  const changePercent = Math.abs(((recentAvg - oldAvg) / oldAvg) * 100);
  
  if (trend === 'improving') {
    return `Dein ${metricName} hat sich um ca. ${changePercent.toFixed(1)}% verbessert.`;
  } else if (trend === 'declining') {
    return `Dein ${metricName} hat sich um ca. ${changePercent.toFixed(1)}% verschlechtert.`;
  } else {
    return `Dein ${metricName} ist relativ stabil geblieben.`;
  }
}

// Musteranalyse
function analyzePatterns(entries: DailyEntry[]): PatternAnalysis[] {
  const patterns: PatternAnalysis[] = [];
  
  // Nur analysieren, wenn genügend Daten vorhanden sind
  if (entries.length < 7) {
    return patterns;
  }

  // Zusammenhang zwischen Sport und Energielevel
  const exerciseDays = entries.filter(hasExercise);
  const nonExerciseDays = entries.filter(entry => !hasExercise(entry));
  
  if (exerciseDays.length > 0 && nonExerciseDays.length > 0) {
    const avgEnergyWithExercise = exerciseDays.reduce((sum, entry) => sum + safeNumber(entry.energyLevel), 0) / exerciseDays.length;
    const avgEnergyWithoutExercise = nonExerciseDays.reduce((sum, entry) => sum + safeNumber(entry.energyLevel), 0) / nonExerciseDays.length;
    const difference = avgEnergyWithExercise - avgEnergyWithoutExercise;
    
    if (Math.abs(difference) > 0.5) {
      patterns.push({
        title: 'Sport und Energielevel',
        description: difference > 0 
          ? `An Tagen mit Sport ist dein Energielevel durchschnittlich um ${difference.toFixed(1)} Punkte höher.`
          : `An Tagen mit Sport ist dein Energielevel durchschnittlich um ${Math.abs(difference).toFixed(1)} Punkte niedriger.`,
        confidence: Math.min(0.5 + Math.abs(difference) / 10, 0.9),
        relatedMetrics: ['Energielevel', 'Sport']
      });
    }
  }

  // Zusammenhang zwischen Schlafqualität und Stimmung
  const sleepQualityCorrelation = calculateCorrelation(
    entries.map(entry => calculateSleepQuality(entry)),
    entries.map(entry => safeNumber(entry.mood))
  );
  
  if (Math.abs(sleepQualityCorrelation) > 0.3) {
    patterns.push({
      title: 'Schlafqualität und Stimmung',
      description: sleepQualityCorrelation > 0 
        ? 'Bessere Schlafqualität scheint mit einer besseren Stimmung zusammenzuhängen.'
        : 'Überraschenderweise scheint deine Schlafqualität negativ mit deiner Stimmung zusammenzuhängen.',
      confidence: Math.min(0.5 + Math.abs(sleepQualityCorrelation), 0.9),
      relatedMetrics: ['Schlafqualität', 'Stimmung']
    });
  }

  // Zusammenhang zwischen Zu-Bett-Geh Routine und Schlafqualität
  const routineCompletedDays = entries.filter(entry => entry.bedtimeRoutine === BedtimeRoutineStatus.COMPLETED);
  const routineNotCompletedDays = entries.filter(entry => 
    entry.bedtimeRoutine === BedtimeRoutineStatus.PARTIAL || 
    entry.bedtimeRoutine === BedtimeRoutineStatus.SKIPPED
  );
  
  if (routineCompletedDays.length > 0 && routineNotCompletedDays.length > 0) {
    const avgSleepQualityWithRoutine = routineCompletedDays.reduce((sum, entry) => 
      sum + calculateSleepQuality(entry), 0) / routineCompletedDays.length;
    
    const avgSleepQualityWithoutRoutine = routineNotCompletedDays.reduce((sum, entry) => 
      sum + calculateSleepQuality(entry), 0) / routineNotCompletedDays.length;
    
    const difference = avgSleepQualityWithRoutine - avgSleepQualityWithoutRoutine;
    
    if (Math.abs(difference) > 0.02) { // 2% Unterschied in der Schlafqualität
      patterns.push({
        title: 'Zu-Bett-Geh Routine und Schlafqualität',
        description: difference > 0 
          ? `An Tagen mit vollständiger Zu-Bett-Geh Routine ist deine Schlafqualität um ca. ${(difference * 100).toFixed(1)}% besser.`
          : `Überraschenderweise ist deine Schlafqualität an Tagen ohne vollständige Zu-Bett-Geh Routine um ca. ${(Math.abs(difference) * 100).toFixed(1)}% besser.`,
        confidence: Math.min(0.5 + Math.abs(difference) * 10, 0.9),
        relatedMetrics: ['Zu-Bett-Geh Routine', 'Schlafqualität']
      });
    }
  }

  return patterns;
}

// Berechne die Korrelation zwischen zwei Datenreihen
function calculateCorrelation(xValues: number[], yValues: number[]): number {
  // Ensure both arrays have the same length and contain only valid numbers
  const validPairs = xValues
    .map((x, i) => [x, yValues[i]])
    .filter(([x, y]) => 
      typeof x === 'number' && !isNaN(x) && 
      typeof y === 'number' && !isNaN(y)
    ) as [number, number][];
  
  if (validPairs.length < 3) return 0;

  const xVals = validPairs.map(([x]) => x);
  const yVals = validPairs.map(([, y]) => y);

  // Berechne Mittelwerte
  const xMean = xVals.reduce((sum, x) => sum + x, 0) / validPairs.length;
  const yMean = yVals.reduce((sum, y) => sum + y, 0) / validPairs.length;

  // Berechne Zähler und Nenner für Korrelationskoeffizient
  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < validPairs.length; i++) {
    const xDiff = xVals[i] - xMean;
    const yDiff = yVals[i] - yMean;
    numerator += xDiff * yDiff;
    denominatorX += xDiff * xDiff;
    denominatorY += yDiff * yDiff;
  }

  // Berechne Korrelationskoeffizient
  const denominator = Math.sqrt(denominatorX * denominatorY);
  return denominator === 0 ? 0 : numerator / denominator;
}

// Generiere Erkenntnisse und Empfehlungen
function generateInsights(entries: DailyEntry[]): Insight[] {
  const insights: Insight[] = [];
  
  // Nur analysieren, wenn genügend Daten vorhanden sind
  if (entries.length < 5) {
    return insights;
  }

  // Letzte 7 Tage oder alle Einträge, falls weniger
  const recentEntries = entries.slice(-Math.min(7, entries.length));
  
  // Schlafmenge-Analyse
  const avgSleepMinutes = recentEntries.reduce((sum, entry) => 
    sum + safeNumber(entry.sleep?.totalSleep), 0) / recentEntries.length;
  if (avgSleepMinutes < 420) { // Weniger als 7 Stunden
    insights.push({
      title: 'Zu wenig Schlaf',
      description: `Du schläfst durchschnittlich nur ${Math.round(avgSleepMinutes / 60)} Stunden pro Nacht.`,
      severity: 'warning',
      recommendation: 'Versuche, mindestens 7-8 Stunden pro Nacht zu schlafen. Etabliere eine regelmäßige Schlafenszeit.'
    });
  }

  // Sport-Analyse
  const exerciseDays = recentEntries.filter(hasExercise).length;
  const exerciseRatio = exerciseDays / recentEntries.length;
  if (exerciseRatio < 0.3) { // Weniger als 30% der Tage Sport
    insights.push({
      title: 'Wenig körperliche Aktivität',
      description: `Du hast nur an ${exerciseDays} von ${recentEntries.length} Tagen Sport gemacht.`,
      severity: exerciseRatio < 0.15 ? 'critical' : 'warning',
      recommendation: 'Versuche, an mindestens 3-4 Tagen pro Woche körperlich aktiv zu sein.'
    });
  }

  // Zu-Bett-Geh Routine-Analyse
  const routineCompletedDays = recentEntries.filter(
    entry => entry.bedtimeRoutine === BedtimeRoutineStatus.COMPLETED
  ).length;
  const routineRatio = routineCompletedDays / recentEntries.length;
  if (routineRatio < 0.5) { // Weniger als 50% der Tage vollständige Routine
    insights.push({
      title: 'Unregelmäßige Zu-Bett-Geh Routine',
      description: `Du hast nur an ${routineCompletedDays} von ${recentEntries.length} Tagen deine Zu-Bett-Geh Routine vollständig eingehalten.`,
      severity: 'info',
      recommendation: 'Eine konsequente Abendroutine kann die Schlafqualität verbessern.'
    });
  }

  // Stimmungs-Analyse
  const avgMood = recentEntries.reduce((sum, entry) => sum + safeNumber(entry.mood), 0) / recentEntries.length;
  if (avgMood < 4) {
    insights.push({
      title: 'Niedrige Stimmung',
      description: `Deine durchschnittliche Stimmung liegt bei ${avgMood.toFixed(1)}/10.`,
      severity: avgMood < 3 ? 'critical' : 'warning',
      recommendation: 'Achte auf dein mentales Wohlbefinden. Erwäge Aktivitäten, die deine Stimmung verbessern können.'
    });
  }

  // Energielevel-Analyse
  const avgEnergy = recentEntries.reduce((sum, entry) => sum + safeNumber(entry.energyLevel), 0) / recentEntries.length;
  if (avgEnergy < 4) {
    insights.push({
      title: 'Niedriges Energielevel',
      description: `Dein durchschnittliches Energielevel liegt bei ${avgEnergy.toFixed(1)}/10.`,
      severity: 'warning',
      recommendation: 'Überprüfe deine Ernährung, Schlaf und Stresslevel, um dein Energielevel zu verbessern.'
    });
  }

  return insights;
}

// Wochentagsanalyse
function analyzeWeekdays(entries: DailyEntry[]): PatternAnalysis[] {
  const patterns: PatternAnalysis[] = [];
  
  if (entries.length < 7) return patterns;

  // Gruppiere Einträge nach Wochentag
  const weekdayData = entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const weekday = date.getDay();
    if (!acc[weekday]) {
      acc[weekday] = [];
    }
    acc[weekday].push(entry);
    return acc;
  }, {} as Record<number, DailyEntry[]>);

  // Analysiere Durchschnittswerte pro Wochentag
  const weekdayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const metrics = [
    { name: 'Energielevel', getter: (e: DailyEntry) => safeNumber(e.energyLevel) },
    { name: 'Stimmung', getter: (e: DailyEntry) => safeNumber(e.mood) },
    { name: 'Schlaf', getter: (e: DailyEntry) => safeNumber(e.sleep?.totalSleep) },
    { name: 'HRV', getter: (e: DailyEntry) => safeNumber(e.sleep?.hrv) }
  ] as const;

  metrics.forEach(metric => {
    const weekdayAverages = Object.entries(weekdayData).map(([day, dayEntries]) => ({
      day: parseInt(day),
      avg: dayEntries.reduce((sum, entry) => sum + metric.getter(entry), 0) / dayEntries.length
    }));

    if (weekdayAverages.length < 2) return;

    const bestDay = weekdayAverages.reduce((best, current) => 
      current.avg > best.avg ? current : best,
      weekdayAverages[0]
    );

    const worstDay = weekdayAverages.reduce((worst, current) => 
      current.avg < worst.avg ? current : worst,
      weekdayAverages[0]
    );

    if (bestDay.avg - worstDay.avg > (metric.name === 'HRV' ? 5 : 1)) {
      patterns.push({
        title: `${metric.name} im Wochenverlauf`,
        description: `Dein ${metric.name} ist typischerweise am ${weekdayNames[bestDay.day]} am höchsten und am ${weekdayNames[worstDay.day]} am niedrigsten.`,
        confidence: 0.7,
        relatedMetrics: [metric.name, 'Wochentag']
      });
    }
  });

  // Analysiere Sportaktivitäten nach Wochentag
  const exerciseByDay = Object.entries(weekdayData).map(([day, dayEntries]) => ({
    day: parseInt(day),
    exerciseRate: dayEntries.filter(hasExercise).length / dayEntries.length
  }));

  if (exerciseByDay.length > 0) {
    const bestExerciseDay = exerciseByDay.reduce((best, current) => 
      current.exerciseRate > best.exerciseRate ? current : best,
      exerciseByDay[0]
    );

    if (bestExerciseDay.exerciseRate > 0.5) {
      patterns.push({
        title: 'Sport im Wochenverlauf',
        description: `Du trainierst am häufigsten am ${weekdayNames[bestExerciseDay.day]} (${Math.round(bestExerciseDay.exerciseRate * 100)}% der Zeit).`,
        confidence: 0.8,
        relatedMetrics: ['Sport', 'Wochentag']
      });
    }
  }

  return patterns;
}

// Sequenzielle Analyse
function analyzeSequentialPatterns(entries: DailyEntry[]): PatternAnalysis[] {
  const patterns: PatternAnalysis[] = [];
  
  if (entries.length < 7) return patterns;

  // Analysiere Auswirkungen von Sport auf den nächsten Tag
  type FollowUpData = {
    energy: number;
    mood: number;
    hrv: number;
  };

  const exerciseDayFollowUps: FollowUpData[] = [];
  const nonExerciseDayFollowUps: FollowUpData[] = [];

  for (let i = 0; i < entries.length - 1; i++) {
    const nextDayEnergy = safeNumber(entries[i + 1].energyLevel);
    const nextDayMood = safeNumber(entries[i + 1].mood);
    const nextDayHRV = safeNumber(entries[i + 1].sleep?.hrv);

    if (hasExercise(entries[i])) {
      exerciseDayFollowUps.push({ energy: nextDayEnergy, mood: nextDayMood, hrv: nextDayHRV });
    } else {
      nonExerciseDayFollowUps.push({ energy: nextDayEnergy, mood: nextDayMood, hrv: nextDayHRV });
    }
  }

  if (exerciseDayFollowUps.length > 0 && nonExerciseDayFollowUps.length > 0) {
    const avgExerciseEnergy = exerciseDayFollowUps.reduce((sum, day) => sum + day.energy, 0) / exerciseDayFollowUps.length;
    const avgNonExerciseEnergy = nonExerciseDayFollowUps.reduce((sum, day) => sum + day.energy, 0) / nonExerciseDayFollowUps.length;
    
    if (Math.abs(avgExerciseEnergy - avgNonExerciseEnergy) > 0.5) {
      patterns.push({
        title: 'Sport und Energie am Folgetag',
        description: avgExerciseEnergy > avgNonExerciseEnergy
          ? `Nach Trainingstagen ist dein Energielevel durchschnittlich um ${(avgExerciseEnergy - avgNonExerciseEnergy).toFixed(1)} Punkte höher.`
          : `Nach Trainingstagen ist dein Energielevel durchschnittlich um ${(avgNonExerciseEnergy - avgExerciseEnergy).toFixed(1)} Punkte niedriger.`,
        confidence: 0.75,
        relatedMetrics: ['Sport', 'Energielevel']
      });
    }

    // Analysiere Auswirkungen auf Stimmung
    const avgExerciseMood = exerciseDayFollowUps.reduce((sum, day) => sum + day.mood, 0) / exerciseDayFollowUps.length;
    const avgNonExerciseMood = nonExerciseDayFollowUps.reduce((sum, day) => sum + day.mood, 0) / nonExerciseDayFollowUps.length;
    
    if (Math.abs(avgExerciseMood - avgNonExerciseMood) > 0.5) {
      patterns.push({
        title: 'Sport und Stimmung am Folgetag',
        description: avgExerciseMood > avgNonExerciseMood
          ? `Nach Trainingstagen ist deine Stimmung durchschnittlich um ${(avgExerciseMood - avgNonExerciseMood).toFixed(1)} Punkte besser.`
          : `Nach Trainingstagen ist deine Stimmung durchschnittlich um ${(avgNonExerciseMood - avgExerciseMood).toFixed(1)} Punkte schlechter.`,
        confidence: 0.75,
        relatedMetrics: ['Sport', 'Stimmung']
      });
    }

    // Analysiere Auswirkungen auf HRV
    const avgExerciseHRV = exerciseDayFollowUps.reduce((sum, day) => sum + day.hrv, 0) / exerciseDayFollowUps.length;
    const avgNonExerciseHRV = nonExerciseDayFollowUps.reduce((sum, day) => sum + day.hrv, 0) / nonExerciseDayFollowUps.length;
    
    if (Math.abs(avgExerciseHRV - avgNonExerciseHRV) > 3) {
      patterns.push({
        title: 'Sport und HRV am Folgetag',
        description: avgExerciseHRV > avgNonExerciseHRV
          ? `Nach Trainingstagen ist deine HRV durchschnittlich um ${Math.round(avgExerciseHRV - avgNonExerciseHRV)} ms höher.`
          : `Nach Trainingstagen ist deine HRV durchschnittlich um ${Math.round(avgNonExerciseHRV - avgExerciseHRV)} ms niedriger.`,
        confidence: 0.75,
        relatedMetrics: ['Sport', 'HRV']
      });
    }
  }

  return patterns;
}

// Sauna-HRV Analyse
function analyzeSaunaHRVCorrelation(entries: DailyEntry[]): PatternAnalysis[] {
  const patterns: PatternAnalysis[] = [];
  
  if (entries.length < 7) return patterns;

  const saunaDayFollowUps: number[] = [];
  const nonSaunaDayFollowUps: number[] = [];

  // Gruppiere Saunabesuche nach Tageszeit
  const morningHRV: number[] = [];
  const afternoonHRV: number[] = [];
  const eveningHRV: number[] = [];

  for (let i = 0; i < entries.length - 1; i++) {
    const nextDayHRV = safeNumber(entries[i + 1].sleep?.hrv);
    const saunaActivity = entries[i].selfCare?.sauna;

    if (saunaActivity?.done) {
      saunaDayFollowUps.push(nextDayHRV);

      if (saunaActivity.time) {
        const hour = parseInt(saunaActivity.time.split(':')[0]);
        if (!isNaN(hour)) {
          if (hour < 12) morningHRV.push(nextDayHRV);
          else if (hour < 17) afternoonHRV.push(nextDayHRV);
          else eveningHRV.push(nextDayHRV);
        }
      }
    } else {
      nonSaunaDayFollowUps.push(nextDayHRV);
    }
  }

  if (saunaDayFollowUps.length > 0 && nonSaunaDayFollowUps.length > 0) {
    const avgSaunaHRV = saunaDayFollowUps.reduce((sum, hrv) => sum + hrv, 0) / saunaDayFollowUps.length;
    const avgNonSaunaHRV = nonSaunaDayFollowUps.reduce((sum, hrv) => sum + hrv, 0) / nonSaunaDayFollowUps.length;
    
    if (Math.abs(avgSaunaHRV - avgNonSaunaHRV) > 3) {
      patterns.push({
        title: 'Sauna und HRV am Folgetag',
        description: avgSaunaHRV > avgNonSaunaHRV
          ? `Nach Saunatagen ist deine HRV durchschnittlich um ${Math.round(avgSaunaHRV - avgNonSaunaHRV)} ms höher.`
          : `Nach Saunatagen ist deine HRV durchschnittlich um ${Math.round(avgNonSaunaHRV - avgSaunaHRV)} ms niedriger.`,
        confidence: 0.8,
        relatedMetrics: ['Sauna', 'HRV']
      });
    }

    // Analysiere beste Tageszeit für Sauna
    const timeSlots = [
      { name: 'Morgen', data: morningHRV },
      { name: 'Nachmittag', data: afternoonHRV },
      { name: 'Abend', data: eveningHRV }
    ].filter(slot => slot.data.length > 0);

    if (timeSlots.length > 1) {
      const bestTimeSlot = timeSlots.reduce((best, current) => {
        const currentAvg = current.data.reduce((sum, hrv) => sum + hrv, 0) / current.data.length;
        const bestAvg = best.data.reduce((sum, hrv) => sum + hrv, 0) / best.data.length;
        return currentAvg > bestAvg ? current : best;
      }, timeSlots[0]);

      patterns.push({
        title: 'Optimale Saunazeit',
        description: `Saunagänge am ${bestTimeSlot.name} scheinen den positivsten Effekt auf deine HRV am nächsten Tag zu haben.`,
        confidence: 0.7,
        relatedMetrics: ['Sauna', 'HRV', 'Tageszeit']
      });
    }
  }

  return patterns;
}

// Eisbad-HRV Analyse
function analyzeIceBathHRVCorrelation(entries: DailyEntry[]): PatternAnalysis[] {
  const patterns: PatternAnalysis[] = [];
  
  if (entries.length < 7) return patterns;

  const iceBathDayFollowUps: number[] = [];
  const nonIceBathDayFollowUps: number[] = [];

  // Gruppiere Eisbadbesuche nach Tageszeit
  const morningHRV: number[] = [];
  const afternoonHRV: number[] = [];
  const eveningHRV: number[] = [];

  for (let i = 0; i < entries.length - 1; i++) {
    const nextDayHRV = safeNumber(entries[i + 1].sleep?.hrv);
    const iceBathActivity = entries[i].selfCare?.iceBath;

    if (iceBathActivity?.done) {
      iceBathDayFollowUps.push(nextDayHRV);

      if (iceBathActivity.time) {
        const hour = parseInt(iceBathActivity.time.split(':')[0]);
        if (!isNaN(hour)) {
          if (hour < 12) morningHRV.push(nextDayHRV);
          else if (hour < 17) afternoonHRV.push(nextDayHRV);
          else eveningHRV.push(nextDayHRV);
        }
      }
    } else {
      nonIceBathDayFollowUps.push(nextDayHRV);
    }
  }

  if (iceBathDayFollowUps.length > 0 && nonIceBathDayFollowUps.length > 0) {
    const avgIceBathHRV = iceBathDayFollowUps.reduce((sum, hrv) => sum + hrv, 0) / iceBathDayFollowUps.length;
    const avgNonIceBathHRV = nonIceBathDayFollowUps.reduce((sum, hrv) => sum + hrv, 0) / nonIceBathDayFollowUps.length;
    
    if (Math.abs(avgIceBathHRV - avgNonIceBathHRV) > 3) {
      patterns.push({
        title: 'Eisbad und HRV am Folgetag',
        description: avgIceBathHRV > avgNonIceBathHRV
          ? `Nach Eisbadtagen ist deine HRV durchschnittlich um ${Math.round(avgIceBathHRV - avgNonIceBathHRV)} ms höher.`
          : `Nach Eisbadtagen ist deine HRV durchschnittlich um ${Math.round(avgNonIceBathHRV - avgIceBathHRV)} ms niedriger.`,
        confidence: 0.8,
        relatedMetrics: ['Eisbad', 'HRV']
      });
    }

    // Analysiere beste Tageszeit für Eisbad
    const timeSlots = [
      { name: 'Morgen', data: morningHRV },
      { name: 'Nachmittag', data: afternoonHRV },
      { name: 'Abend', data: eveningHRV }
    ].filter(slot => slot.data.length > 0);

    if (timeSlots.length > 1) {
      const bestTimeSlot = timeSlots.reduce((best, current) => {
        const currentAvg = current.data.reduce((sum, hrv) => sum + hrv, 0) / current.data.length;
        const bestAvg = best.data.reduce((sum, hrv) => sum + hrv, 0) / best.data.length;
        return currentAvg > bestAvg ? current : best;
      }, timeSlots[0]);

      patterns.push({
        title: 'Optimale Eisbadzeit',
        description: `Eisbäder am ${bestTimeSlot.name} scheinen den positivsten Effekt auf deine HRV am nächsten Tag zu haben.`,
        confidence: 0.7,
        relatedMetrics: ['Eisbad', 'HRV', 'Tageszeit']
      });
    }
  }

  return patterns;
}

// Sport-HRV Korrelation
function analyzeExerciseHRVCorrelation(entries: DailyEntry[]): PatternAnalysis[] {
  const patterns: PatternAnalysis[] = [];
  
  if (entries.length < 7) return patterns;

  // Analysiere HRV basierend auf Trainingsintensität (Dauer)
  const exerciseEntries = entries.filter(entry => 
    hasExercise(entry) && entry.exercise?.activities && entry.exercise.activities.length > 0
  );
  
  if (exerciseEntries.length > 0) {
    // Gruppiere nach Trainingsdauer
    const shortWorkouts: number[] = []; // < 30 Minuten
    const mediumWorkouts: number[] = []; // 30-60 Minuten
    const longWorkouts: number[] = []; // > 60 Minuten

    exerciseEntries.forEach(entry => {
      const totalDuration = entry.exercise?.activities?.reduce((sum, activity) => 
        sum + (activity.duration || 0), 0) || 0;
      const nextDayHRV = safeNumber(entries.find(e => e.date === getNextDay(entry.date))?.sleep?.hrv);

      if (totalDuration < 30) shortWorkouts.push(nextDayHRV);
      else if (totalDuration < 60) mediumWorkouts.push(nextDayHRV);
      else longWorkouts.push(nextDayHRV);
    });

    // Analysiere die besten Trainingsdauern für HRV
    const durationSlots = [
      { name: 'kurze (< 30 Min)', data: shortWorkouts },
      { name: 'mittlere (30-60 Min)', data: mediumWorkouts },
      { name: 'lange (> 60 Min)', data: longWorkouts }
    ].filter(slot => slot.data.length > 0);

    if (durationSlots.length > 1) {
      const bestDuration = durationSlots.reduce((best, current) => {
        const currentAvg = current.data.reduce((sum, hrv) => sum + hrv, 0) / current.data.length;
        const bestAvg = best.data.reduce((sum, hrv) => sum + hrv, 0) / best.data.length;
        return currentAvg > bestAvg ? current : best;
      }, durationSlots[0]);

      patterns.push({
        title: 'Optimale Trainingsdauer für HRV',
        description: `${bestDuration.name} Trainingseinheiten scheinen den positivsten Effekt auf deine HRV am nächsten Tag zu haben.`,
        confidence: 0.75,
        relatedMetrics: ['Sport', 'HRV', 'Trainingsdauer']
      });
    }
  }

  return patterns;
}

// Schlafzeit-HRV Korrelation
function analyzeSleepHRVCorrelation(entries: DailyEntry[]): PatternAnalysis[] {
  const patterns: PatternAnalysis[] = [];
  
  if (entries.length < 7) return patterns;

  // Gruppiere nach Schlafmenge
  const shortSleep: number[] = []; // < 6 Stunden
  const mediumSleep: number[] = []; // 6-8 Stunden
  const longSleep: number[] = []; // > 8 Stunden

  entries.forEach(entry => {
    const totalSleep = safeNumber(entry.sleep?.totalSleep);
    const hrv = safeNumber(entry.sleep?.hrv);
    
    if (totalSleep > 0 && hrv > 0) {
      const sleepHours = totalSleep / 60;
      if (sleepHours < 6) shortSleep.push(hrv);
      else if (sleepHours < 8) mediumSleep.push(hrv);
      else longSleep.push(hrv);
    }
  });

  // Analysiere die beste Schlafmenge für HRV
  const sleepSlots = [
    { name: 'wenig (< 6h)', data: shortSleep },
    { name: 'mittel (6-8h)', data: mediumSleep },
    { name: 'viel (> 8h)', data: longSleep }
  ].filter(slot => slot.data.length > 0);

  if (sleepSlots.length > 1) {
    const bestSleepAmount = sleepSlots.reduce((best, current) => {
      const currentAvg = current.data.reduce((sum, hrv) => sum + hrv, 0) / current.data.length;
      const bestAvg = best.data.reduce((sum, hrv) => sum + hrv, 0) / best.data.length;
      return currentAvg > bestAvg ? current : best;
    }, sleepSlots[0]);

    patterns.push({
      title: 'Optimale Schlafmenge für HRV',
      description: `${bestSleepAmount.name} Schlaf scheint den positivsten Effekt auf deine HRV zu haben.`,
      confidence: 0.8,
      relatedMetrics: ['Schlaf', 'HRV', 'Schlafmenge']
    });
  }

  // Berechne Korrelation zwischen Schlafmenge und HRV
  const sleepHRVCorrelation = calculateCorrelation(
    entries.map(entry => safeNumber(entry.sleep?.totalSleep)),
    entries.map(entry => safeNumber(entry.sleep?.hrv))
  );

  if (Math.abs(sleepHRVCorrelation) > 0.3) {
    patterns.push({
      title: 'Schlafmenge und HRV Korrelation',
      description: sleepHRVCorrelation > 0
        ? 'Mehr Schlaf scheint mit einer höheren HRV zusammenzuhängen.'
        : 'Überraschenderweise scheint mehr Schlaf mit einer niedrigeren HRV zusammenzuhängen.',
      confidence: Math.min(0.5 + Math.abs(sleepHRVCorrelation), 0.9),
      relatedMetrics: ['Schlaf', 'HRV']
    });
  }

  return patterns;
}

// Hilfsfunktion für das Datum des nächsten Tages
function getNextDay(dateString: string): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}
