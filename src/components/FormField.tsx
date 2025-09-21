'use client'; // Add this directive at the very top

import React, { useState } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  htmlFor, 
  children, 
  className = '' 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Clone children and add focus handlers
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onFocus: (e: React.FocusEvent) => {
          setIsFocused(true);
          if (child.props.onFocus) child.props.onFocus(e);
        },
        onBlur: (e: React.FocusEvent) => {
          setIsFocused(false);
          if (child.props.onBlur) child.props.onBlur(e);
        }
      });
    }
    return child;
  });

  return (
    <div className={`mb-4 ${className} transition-all duration-300 ${isFocused? 'transform -translate-y-1' : ''}`}>
      <label 
        htmlFor={htmlFor} 
        className={`label transition-all duration-300 ${isFocused? 'text-primary' : ''}`}
      >
        {label}
      </label>
      {enhancedChildren}
    </div>
  );
};

export default FormField;