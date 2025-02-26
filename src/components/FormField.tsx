import React from 'react';

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
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormField;
