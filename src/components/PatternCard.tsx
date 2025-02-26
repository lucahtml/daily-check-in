'use client';

import React from 'react';
import { PatternAnalysis } from '@/lib/analysis';

interface PatternCardProps {
  pattern: PatternAnalysis;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern }) => {
  // Berechne die Konfidenzklasse basierend auf dem Konfidenzwert
  const getConfidenceClass = (confidence: number): string => {
    if (confidence >= 0.7) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Formatiere den Konfidenzwert als Prozentsatz
  const confidencePercent = Math.round(pattern.confidence * 100);

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{pattern.title}</h3>
        <span 
          className={`text-xs px-2 py-1 rounded-full ${getConfidenceClass(pattern.confidence)}`}
        >
          {confidencePercent}% Konfidenz
        </span>
      </div>
      
      <p className="text-gray-700 mb-3">{pattern.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {pattern.relatedMetrics.map((metric, index) => (
          <span 
            key={index} 
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
          >
            {metric}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PatternCard;
