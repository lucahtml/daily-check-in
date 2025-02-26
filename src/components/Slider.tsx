import React, { useState, useEffect } from 'react';

interface SliderProps {
  id: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  showValue?: boolean;
}

const Slider: React.FC<SliderProps> = ({ 
  id, 
  min, 
  max, 
  value, 
  onChange, 
  showValue = true 
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  
  // Calculate percentage for background gradient
  const percentage = ((localValue - min) / (max - min)) * 100;
  
  // Update local value when prop changes
  useEffect(() => {
    if (!isChanging) {
      setLocalValue(value);
    }
  }, [value, isChanging]);
  
  // Handle change and update parent when done
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          value={localValue}
          onChange={handleChange}
          onMouseDown={() => setIsChanging(true)}
          onMouseUp={() => setIsChanging(false)}
          onTouchStart={() => setIsChanging(true)}
          onTouchEnd={() => setIsChanging(false)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
          }}
        />
        {showValue && (
          <span className={`ml-3 min-w-[2rem] text-center font-medium transition-all duration-300 ${
            isChanging ? 'text-primary scale-110' : ''
          }`}>
            {localValue}
          </span>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;
