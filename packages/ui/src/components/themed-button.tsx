import React from 'react';
import { Button, ButtonProps, styled, Text, TamaguiComponent } from 'tamagui';

// Interface must be defined before being used in ThemedButton's type annotation
export interface ThemedButtonProps extends ButtonProps {
  intentType?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  buttonStyleSize?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const ThemedButton: TamaguiComponent<ThemedButtonProps, any /* TamaguiButton type or HTMLButtonElement */> = styled(Button, {
  name: 'ThemedButton',
  
  variants: {
    intentType: {
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
    buttonStyleSize: {
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
    intentType: 'primary' as any,
    buttonStyleSize: 'medium' as any,
  },
});

// Reverted to original props structure for simplicity for now
export interface ThemedButtonProps extends ButtonProps {
  intentType?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  buttonStyleSize?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export function ResearchBeeButton({
  intentType = 'primary',
  buttonStyleSize = 'medium',
  children,
  ...props
}: ThemedButtonProps) {
  return (
    <ThemedButton
      intentType={intentType}
      buttonStyleSize={buttonStyleSize}
      {...props}
    >
      {children}
    </ThemedButton>
  );
} 