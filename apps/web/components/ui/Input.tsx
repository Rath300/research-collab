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

    // Modern light theme input styles with responsive design
    const commonClasses = cn(
      'flex w-full rounded-lg border bg-bg-tertiary px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-text-primary font-body ',
      'placeholder:text-text-muted caret-accent-primary ',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:border-accent-primary ',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-quaternary ',
      'transition-all duration-200 ease-in-out ',
      'min-h-[44px] sm:min-h-[48px] ', // Better touch targets for mobile
      'text-base sm:text-sm ', // Larger text on mobile for better readability
      props.error 
        ? 'border-accent-error focus-visible:ring-accent-error focus-visible:border-accent-error' 
        : 'border-border-medium hover:border-border-dark focus-visible:border-accent-primary',
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
        className={cn(commonClasses, 'h-11 sm:h-12')} // Responsive height
        ref={ref as React.Ref<HTMLInputElement>}
        {...standardInputSpecificProps}
      />
    );
  }
);
Input.displayName = 'Input' 