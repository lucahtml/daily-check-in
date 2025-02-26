import React, { useState } from 'react';

interface AnimatedCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={`flex items-center mb-3 ${className} ${isAnimating ? 'input-success' : ''}`}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="w-5 h-5 cursor-pointer"
        />
        {/* Custom animation overlay */}
        {isAnimating && (
          <span className="absolute inset-0 pointer-events-none">
            <span className="absolute inset-0 bg-primary bg-opacity-10 rounded-full animate-ping" />
          </span>
        )}
      </div>
      <label
        htmlFor={id}
        className="ml-2 text-gray-700 cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
};

export default AnimatedCheckbox;
