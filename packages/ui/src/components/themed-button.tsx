import React from 'react';
import { Button, ButtonProps, styled, Text } from 'tamagui';

export const ThemedButton = styled(Button, {
  name: 'ThemedButton',
  
  variants: {
    variant: {
      primary: {
        backgroundColor: '$researchbeeYellow',
        color: '$researchbeeBlack',
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: 'transparent',
        color: '$researchbeeYellow',
        borderWidth: 1,
        borderColor: '$researchbeeYellow',
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: '$color',
        borderWidth: 0,
      },
      destructive: {
        backgroundColor: '$red9',
        color: '$white',
        borderWidth: 0,
      },
    },
    size: {
      small: {
        paddingHorizontal: '$2',
        paddingVertical: '$1',
        borderRadius: '$1',
      },
      medium: {
        paddingHorizontal: '$3',
        paddingVertical: '$2',
        borderRadius: '$2',
      },
      large: {
        paddingHorizontal: '$4',
        paddingVertical: '$3',
        borderRadius: '$3',
      },
    },
  },
  
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

export interface ThemedButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export function ResearchBeeButton({
  variant = 'primary',
  size = 'medium',
  children,
  ...props
}: ThemedButtonProps) {
  return (
    <ThemedButton
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </ThemedButton>
  );
} 