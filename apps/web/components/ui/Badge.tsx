import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'primary' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const getBadgeClasses = (variant: BadgeVariant = 'secondary') => {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'border-transparent bg-blue-600 text-blue-50 hover:bg-blue-600/80',
    secondary: 'border-transparent bg-gray-700 text-gray-200 hover:bg-gray-700/80',
    destructive: 'border-transparent bg-red-600 text-red-50 hover:bg-red-600/80',
    outline: 'text-white',
  };

  return `${baseClasses} ${variantClasses[variant]}`;
};

function Badge({ className, variant = 'secondary', ...props }: BadgeProps) {
  return (
    <div className={cn(getBadgeClasses(variant), className)} {...props} />
  );
}

export { Badge }; 
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-blue-600 text-blue-50 hover:bg-blue-600/80',
        secondary:
          'border-transparent bg-gray-700 text-gray-200 hover:bg-gray-700/80',
        destructive:
          'border-transparent bg-red-600 text-red-50 hover:bg-red-600/80',
        outline: 'text-white',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }; 