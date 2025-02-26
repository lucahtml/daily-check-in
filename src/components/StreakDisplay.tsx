import React from 'react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  monthlyCheckpoints: number[];
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ 
  currentStreak, 
  longestStreak,
  monthlyCheckpoints
}) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Deine Streak</h2>
        {currentStreak > 0 && (
          <span className="text-primary font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            {currentStreak} Tage
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm">Aktuelle Streak</p>
          <p className="font-medium text-xl">{currentStreak} Tage</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Längste Streak</p>
          <p className="font-medium text-xl">{longestStreak} Tage</p>
        </div>
      </div>
      
      {monthlyCheckpoints.length > 0 && (
        <div>
          <p className="text-gray-600 text-sm mb-2">Monatliche Meilensteine</p>
          <div className="flex flex-wrap gap-2">
            {monthlyCheckpoints.map((checkpoint, index) => (
              <div 
                key={index} 
                className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
              >
                {checkpoint} Tage
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
