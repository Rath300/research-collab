'use client';

import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: boolean;
  containerClassName?: string;
}

const inputBaseClass = "flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 font-sans appearance-none pr-8";

export function Select({
  id,
  name,
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  className = '',
  containerClassName = '',
  ...props
}: SelectProps) {
  const selectId = id || name;

  return (
    <div className={`relative w-full ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-neutral-300 mb-1.5 font-sans"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${inputBaseClass} ${error ? 'border-red-600 focus-visible:ring-red-500' : ''} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden={value !== ""}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <FiChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none"
        />
      </div>
      {/* 
        If you have an error message prop for the Select component similar to Input,
        you can add its rendering here, for example:
        {error && typeof error === 'string' && (
          <p className="mt-1 text-sm text-red-400 font-sans">{error}</p>
        )}
      */}
    </div>
  );
} 