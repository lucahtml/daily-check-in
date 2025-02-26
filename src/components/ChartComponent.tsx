'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendAnalysis } from '@/lib/analysis';

// Registriere die benötigten Chart.js Komponenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  trendData: TrendAnalysis;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ trendData }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  };

  // Konfiguriere die Diagrammoptionen
  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: trendData.metric,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${trendData.metric}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
      }
    },
  };

  // Bereite die Daten für das Diagramm vor
  const data = {
    labels: trendData.dates.map(formatDate),
    datasets: [
      {
        label: trendData.metric,
        data: trendData.data,
        borderColor: getTrendColor(trendData.trend),
        backgroundColor: getTrendColor(trendData.trend, 0.2),
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="card p-4">
      <Line options={options} data={data} />
      <p className="mt-2 text-sm text-gray-600">{trendData.description}</p>
    </div>
  );
};

// Hilfsfunktion zur Bestimmung der Farbe basierend auf dem Trend
function getTrendColor(trend: 'improving' | 'declining' | 'stable', alpha = 1): string {
  switch (trend) {
    case 'improving':
      return `rgba(34, 197, 94, ${alpha})`; // Grün
    case 'declining':
      return `rgba(239, 68, 68, ${alpha})`; // Rot
    case 'stable':
    default:
      return `rgba(59, 130, 246, ${alpha})`; // Blau
  }
}

export default ChartComponent;
