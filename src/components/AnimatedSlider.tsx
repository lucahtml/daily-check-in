import React, { useState, useEffect } from 'react';

interface AnimatedSliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  valueLabels?: Record<number, string>;
}

const AnimatedSlider: React.FC<AnimatedSliderProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  showValue = true,
  valueLabels,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Calculate percentage for background gradient
  const percentage = ((localValue - min) / (max - min)) * 100;
  
  // Handle local value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
  };
  
  // Update parent component when user finishes changing
  const handleChangeComplete = () => {
    setIsChanging(false);
    onChange(localValue);
    
    // Show success animation
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 500);
  };

  // Update local value when prop changes
  useEffect(() => {
    if (!isChanging) {
      setLocalValue(value);
    }
  }, [value, isChanging]);

  return (
    <div className={`mb-6 ${showSuccess ? 'input-success' : ''}`}>
      <div className="flex justify-between mb-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {showValue && (
          <span className="text-sm font-medium text-primary">
            {valueLabels ? valueLabels[localValue] : localValue}
          </span>
        )}
      </div>
      
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          onMouseDown={() => setIsChanging(true)}
          onMouseUp={handleChangeComplete}
          onTouchStart={() => setIsChanging(true)}
          onTouchEnd={handleChangeComplete}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
          }}
        />
        
        {/* Value markers */}
        <div className="flex justify-between mt-1">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i)
            .filter(num => num % Math.ceil((max - min) / 5) === 0 || num === min || num === max)
            .map(num => (
              <div key={num} className="text-xs text-gray-400 text-center" style={{ width: '20px' }}>
                {num}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedSlider;
