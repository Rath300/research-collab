"use client";

import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
  helper?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helper, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5">
        <input
          ref={ref}
          className={clsx(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/75",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500/50",
            className
          )}
          {...props}
        />
        {helper && (
          <p className={clsx("text-xs", error ? "text-red-500" : "text-muted-foreground")}>
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
