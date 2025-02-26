import React from 'react';

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
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        {showValue && (
          <span className="ml-3 min-w-[2rem] text-center font-medium">
            {value}
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
