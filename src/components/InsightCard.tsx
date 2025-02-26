'use client';

import React from 'react';
import { Insight } from '@/lib/analysis';

interface InsightCardProps {
  insight: Insight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  // Bestimme die Stilklassen basierend auf dem Schweregrad
  const getSeverityClasses = (severity: 'info' | 'warning' | 'critical'): {
    cardClass: string;
    iconClass: string;
    icon: React.ReactNode;
  } => {
    switch (severity) {
      case 'critical':
        return {
          cardClass: 'border-red-500 bg-red-50',
          iconClass: 'bg-red-500 text-white',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'warning':
        return {
          cardClass: 'border-yellow-500 bg-yellow-50',
          iconClass: 'bg-yellow-500 text-white',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          cardClass: 'border-blue-500 bg-blue-50',
          iconClass: 'bg-blue-500 text-white',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const { cardClass, iconClass, icon } = getSeverityClasses(insight.severity);

  return (
    <div className={`card p-4 border-l-4 ${cardClass}`}>
      <div className="flex items-start">
        <div className={`p-2 rounded-full mr-3 ${iconClass}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{insight.title}</h3>
          <p className="text-gray-700 my-2">{insight.description}</p>
          <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
            <p className="text-sm font-medium text-gray-900">Empfehlung:</p>
            <p className="text-sm text-gray-700">{insight.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
