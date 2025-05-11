import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  as?: React.ElementType;
}

export const Card = ({ children, className, hoverEffect = false, as: Component = 'div' }: CardProps) => {
  return (
    <Component
      className={twMerge(
        'rounded-xl bg-black/20 backdrop-blur-lg border border-white/10 shadow-2xl',
        'p-6',
        hoverEffect && 'transition-all duration-300 hover:shadow-purple-500/30 hover:border-white/20 hover:bg-black/30',
        className
      )}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div className={twMerge('pb-4 mb-4 border-b border-white/10', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle = ({ children, className }: CardTitleProps) => {
  return (
    <h3 className={twMerge('text-xl lg:text-2xl font-semibold text-white', className)}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription = ({ children, className }: CardDescriptionProps) => {
  return (
    <p className={twMerge('text-sm text-gray-300 leading-relaxed', className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = ({ children, className }: CardContentProps) => {
  return (
    <div className={twMerge('', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <div className={twMerge('pt-4 mt-4 border-t border-white/10 flex items-center', className)}>
      {children}
    </div>
  );
}; 