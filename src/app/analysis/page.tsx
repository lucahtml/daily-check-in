'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEntries } from '@/lib/storage';
import { analyzeEntries, AnalysisReport, TrendAnalysis } from '@/lib/analysis';
import ChartComponent from '@/components/ChartComponent';
import PatternCard from '@/components/PatternCard';
import InsightCard from '@/components/InsightCard';

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport>({
    trends: [],
    patterns: [],
    insights: []
  });
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    const loadAndAnalyzeData = () => {
      const entries = getEntries();
      
      if (entries.length === 0) {
        setIsLoading(false);
        return;
      }

      // Sortiere Einträge nach Datum (neueste zuerst)
      const sortedEntries = [...entries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Filtere Einträge basierend auf dem ausgewählten Zeitraum
      let filteredEntries = sortedEntries;
      
      if (timeRange === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredEntries = sortedEntries.filter(entry => 
          new Date(entry.date) >= oneWeekAgo
        );
      } else if (timeRange === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredEntries = sortedEntries.filter(entry => 
          new Date(entry.date) >= oneMonthAgo
        );
      }

      // Analysiere die gefilterten Einträge
      const report = analyzeEntries(filteredEntries);
      
      setAnalysisReport(report);
      
      // Setze den ersten Trend als ausgewählt, falls vorhanden und noch keiner ausgewählt ist
      if (report.trends.length > 0 && !selectedTrend) {
        setSelectedTrend(report.trends[0].metric);
      }
      
      setIsLoading(false);
    };

    loadAndAnalyzeData();
  }, [timeRange, selectedTrend]);

  // Finde den aktuell ausgewählten Trend
  const selectedTrendData = analysisReport.trends.find(trend => trend.metric === selectedTrend);

  return (
    <div className="py-4 space-y-6">
      <header className="flex justify-between items-center">
        <Link href="/" className="text-primary hover:underline">
          &larr; Zurück
        </Link>
        <h1 className="text-2xl font-bold text-center">Datenanalyse</h1>
        <div className="w-16"></div> {/* Platzhalter für die Ausrichtung */}
      </header>

      {/* Zeitraumauswahl */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeRange === 'week'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-300`}
          >
            Woche
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border-t border-b border-r border-gray-300`}
          >
            Monat
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeRange === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border-t border-b border-r border-gray-300`}
          >
            Alle
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p>Analysiere Daten...</p>
        </div>
      ) : analysisReport.trends.length === 0 ? (
        <div className="text-center py-8 card">
          <p className="text-gray-500">Nicht genügend Daten für eine Analyse vorhanden.</p>
          <p className="mt-2">
            <Link href="/new-entry" className="text-primary hover:underline">
              Erstelle mehr Einträge für detaillierte Analysen
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* Trend-Auswahl */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {analysisReport.trends.map((trend) => (
              <button
                key={trend.metric}
                onClick={() => setSelectedTrend(trend.metric)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedTrend === trend.metric
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {trend.metric}
              </button>
            ))}
          </div>

          {/* Diagramm */}
          {selectedTrendData && (
            <div className="mb-8">
              <ChartComponent trendData={selectedTrendData} />
            </div>
          )}

          {/* Erkenntnisse */}
          {analysisReport.insights.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Erkenntnisse & Empfehlungen</h2>
              <div className="space-y-4">
                {analysisReport.insights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {/* Muster */}
          {analysisReport.patterns.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Erkannte Muster</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisReport.patterns.map((pattern, index) => (
                  <PatternCard key={index} pattern={pattern} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
