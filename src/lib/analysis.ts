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

  return {
    trends: analyzeTrends(sortedEntries),
    patterns: analyzePatterns(sortedEntries),
    insights: generateInsights(sortedEntries)
  };
}

// Trendanalyse für verschiedene Metriken
function analyzeTrends(entries: DailyEntry[]): TrendAnalysis[] {
  const trends: TrendAnalysis[] = [];
  
  // Nur analysieren, wenn genügend Daten vorhanden sind
  if (entries.length < 3) {
    return trends;
  }

  // Energielevel-Trend
  const energyData = entries.map(entry => entry.energyLevel);
  const energyDates = entries.map(entry => entry.date);
  trends.push({
    metric: 'Energielevel',
    description: getTrendDescription(energyData, 'Energielevel'),
    trend: determineTrend(energyData),
    data: energyData,
    dates: energyDates
  });

  // Stimmungs-Trend
  const moodData = entries.map(entry => entry.mood);
  const moodDates = entries.map(entry => entry.date);
  trends.push({
    metric: 'Stimmung',
    description: getTrendDescription(moodData, 'Stimmung'),
    trend: determineTrend(moodData),
    data: moodData,
    dates: moodDates
  });

  // Schlafqualität-Trend (basierend auf Tiefschlaf-Prozentsatz)
  const sleepQualityData = entries.map(entry => {
    const totalSleep = entry.sleep.totalSleep;
    return totalSleep > 0 ? (entry.sleep.deepSleep / totalSleep) * 100 : 0;
  });
  const sleepDates = entries.map(entry => entry.date);
  trends.push({
    metric: 'Schlafqualität',
    description: getTrendDescription(sleepQualityData, 'Schlafqualität (% Tiefschlaf)'),
    trend: determineTrend(sleepQualityData),
    data: sleepQualityData,
    dates: sleepDates
  });

  // Protein-Trend
  const proteinData = entries.map(entry => entry.proteinIntake || 0);
  const proteinDates = entries.map(entry => entry.date);
  trends.push({
    metric: 'Proteinaufnahme',
    description: getTrendDescription(proteinData, 'Proteinaufnahme'),
    trend: determineTrend(proteinData),
    data: proteinData,
    dates: proteinDates
  });

  // HRV-Trend
  const hrvData = entries.map(entry => entry.sleep.hrv);
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
  const exerciseDays = entries.filter(entry => entry.exercise.didExercise);
  const nonExerciseDays = entries.filter(entry => !entry.exercise.didExercise);
  
  if (exerciseDays.length > 0 && nonExerciseDays.length > 0) {
    const avgEnergyWithExercise = exerciseDays.reduce((sum, entry) => sum + entry.energyLevel, 0) / exerciseDays.length;
    const avgEnergyWithoutExercise = nonExerciseDays.reduce((sum, entry) => sum + entry.energyLevel, 0) / nonExerciseDays.length;
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
    entries.map(entry => entry.sleep.deepSleep / entry.sleep.totalSleep),
    entries.map(entry => entry.mood)
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

  // Zusammenhang zwischen Proteinaufnahme und Energielevel
  const proteinCorrelation = calculateCorrelation(
    entries.map(entry => entry.proteinIntake || 0),
    entries.map(entry => entry.energyLevel)
  );
  
  if (Math.abs(proteinCorrelation) > 0.3) {
    patterns.push({
      title: 'Proteinaufnahme und Energielevel',
      description: proteinCorrelation > 0 
        ? 'Höhere Proteinaufnahme scheint mit einem höheren Energielevel zusammenzuhängen.'
        : 'Überraschenderweise scheint deine Proteinaufnahme negativ mit deinem Energielevel zusammenzuhängen.',
      confidence: Math.min(0.5 + Math.abs(proteinCorrelation), 0.9),
      relatedMetrics: ['Proteinaufnahme', 'Energielevel']
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
      sum + (entry.sleep.deepSleep / entry.sleep.totalSleep), 0) / routineCompletedDays.length;
    
    const avgSleepQualityWithoutRoutine = routineNotCompletedDays.reduce((sum, entry) => 
      sum + (entry.sleep.deepSleep / entry.sleep.totalSleep), 0) / routineNotCompletedDays.length;
    
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
  const n = Math.min(xValues.length, yValues.length);
  if (n < 3) return 0;

  // Berechne Mittelwerte
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

  // Berechne Zähler und Nenner für Korrelationskoeffizient
  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
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
  const avgSleepMinutes = recentEntries.reduce((sum, entry) => sum + entry.sleep.totalSleep, 0) / recentEntries.length;
  if (avgSleepMinutes < 420) { // Weniger als 7 Stunden
    insights.push({
      title: 'Zu wenig Schlaf',
      description: `Du schläfst durchschnittlich nur ${Math.round(avgSleepMinutes / 60)} Stunden pro Nacht.`,
      severity: 'warning',
      recommendation: 'Versuche, mindestens 7-8 Stunden pro Nacht zu schlafen. Etabliere eine regelmäßige Schlafenszeit.'
    });
  }

  // Proteinaufnahme-Analyse
  const avgProtein = recentEntries.reduce((sum, entry) => sum + (entry.proteinIntake || 0), 0) / recentEntries.length;
  if (avgProtein < 60) {
    insights.push({
      title: 'Niedrige Proteinaufnahme',
      description: `Deine durchschnittliche Proteinaufnahme beträgt nur ${Math.round(avgProtein)}g pro Tag.`,
      severity: 'info',
      recommendation: 'Erwäge, deine Proteinaufnahme auf mindestens 0,8g pro kg Körpergewicht zu erhöhen.'
    });
  }

  // Sport-Analyse
  const exerciseDays = recentEntries.filter(entry => entry.exercise.didExercise).length;
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
  const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
  if (avgMood < 4) {
    insights.push({
      title: 'Niedrige Stimmung',
      description: `Deine durchschnittliche Stimmung liegt bei ${avgMood.toFixed(1)}/10.`,
      severity: avgMood < 3 ? 'critical' : 'warning',
      recommendation: 'Achte auf dein mentales Wohlbefinden. Erwäge Aktivitäten, die deine Stimmung verbessern können.'
    });
  }

  // Energielevel-Analyse
  const avgEnergy = recentEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / recentEntries.length;
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
