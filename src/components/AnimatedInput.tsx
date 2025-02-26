import React, { useState, useEffect, useRef } from 'react';

interface AnimatedInputProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  min,
  max,
  step,
  placeholder,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const [showSuccess, setShowSuccess] = useState(false);
  const prevValueRef = useRef<string | number>(value);

  useEffect(() => {
    setHasValue(!!value);
    
    // Show success animation when value changes (but not on initial render)
    if (value !== prevValueRef.current && prevValueRef.current !== undefined) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    prevValueRef.current = value;
  }, [value]);

  return (
    <div className="mb-4 relative">
      <label 
        htmlFor={id}
        className={`absolute transition-all duration-200 ${
          isFocused || hasValue 
            ? 'text-xs text-primary transform -translate-y-6' 
            : 'text-base text-gray-500 transform translate-y-2'
        }`}
      >
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full py-2 px-3 border-b-2 bg-transparent 
          focus:outline-none transition-all duration-200
          ${isFocused ? 'border-primary' : 'border-gray-300'}
          ${showSuccess ? 'input-success' : ''}
        `}
      />
      
      {/* Success indicator */}
      {showSuccess && (
        <div className="absolute right-2 top-2 text-primary opacity-70">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AnimatedInput;
