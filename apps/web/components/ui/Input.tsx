import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Base props common to both input and textarea, excluding 'type' which will be the discriminant
interface BaseInputProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  className?: string; // Add className to base if it's used commonly outside of specific element styling
}

// Props for standard input elements
interface StandardInputHtmlProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {}
interface StandardInputProps extends BaseInputProps, StandardInputHtmlProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';
}

// Props for textarea element
interface TextAreaHtmlProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}
interface TextAreaProps extends BaseInputProps, TextAreaHtmlProps {
  type: 'textarea';
  // rows is part of TextareaHTMLAttributes so it's included via TextAreaHtmlProps
}

export type InputProps = StandardInputProps | TextAreaProps;

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (props, ref) => {
    const { className, type, ...rest } = props;

    // Updated commonClasses for glassmorphic style
    const commonClasses = cn(
      'flex w-full rounded-lg border bg-white/5 backdrop-blur-sm px-4 py-2.5 text-sm text-gray-100 ',
      'placeholder:text-gray-400 caret-purple-400 ',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent ',
      'disabled:cursor-not-allowed disabled:opacity-50 ',
      'transition-all duration-200 ease-in-out ',
      props.error ? 'border-red-500/70 focus-visible:ring-red-500' : 'border-white/20 hover:border-white/40',
      className // User-provided className for the wrapper or element itself
    );

    if (type === 'textarea') {
      // Ensure rest includes rows and other textarea specific props
      const textAreaSpecificProps = rest as Omit<TextAreaProps, 'type' | 'className'>;
      return (
        <textarea
          className={cn(commonClasses, 'h-auto min-h-[100px]')} 
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...textAreaSpecificProps}
        />
      );
    }
    
    // Ensure rest includes value, onChange etc for input
    const standardInputSpecificProps = rest as Omit<StandardInputProps, 'type' | 'className'>;
    return (
      <input
        type={type || 'text'} // Default to text if type is undefined
        className={cn(commonClasses, 'h-11')} // Slightly taller for better visual
        ref={ref as React.Ref<HTMLInputElement>}
        {...standardInputSpecificProps}
      />
    );
  }
);
Input.displayName = 'Input' 