import React from 'react';
import { Button as TamaguiButton, ButtonProps, styled, Spinner, Text, XStack } from 'tamagui';

const CustomButton = styled(TamaguiButton, {
  name: 'CustomButton',
  borderRadius: '$3',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$2',
  
  variants: {
    variant: {
      primary: {
        backgroundColor: '$researchbeeYellow',
        color: '$color',
        borderColor: '$researchbeeYellow',
        hoverStyle: {
          backgroundColor: '$researchbeeYellowDark',
          borderColor: '$researchbeeYellowDark',
        },
        pressStyle: {
          backgroundColor: '$researchbeeYellowPress',
          borderColor: '$researchbeeYellowPress',
        },
      },
      secondary: {
        backgroundColor: 'transparent',
        color: '$color',
        borderColor: '$borderColor',
        borderWidth: 1,
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '$researchbeeYellow',
        borderColor: '$researchbeeYellow',
        borderWidth: 1,
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      danger: {
        backgroundColor: '$red9',
        color: 'white',
        borderColor: '$red9',
        hoverStyle: {
          backgroundColor: '$red10',
          borderColor: '$red10',
        },
        pressStyle: {
          backgroundColor: '$red11',
          borderColor: '$red11',
        },
      },
    },
    size: {
      small: {
        height: '$3',
        paddingHorizontal: '$2.5',
        paddingVertical: '$1.5',
        fontSize: '$1',
      },
      medium: {
        height: '$4',
        paddingHorizontal: '$3',
        paddingVertical: '$2',
        fontSize: '$2',
      },
      large: {
        height: '$5',
        paddingHorizontal: '$4',
        paddingVertical: '$2.5',
        fontSize: '$3',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,
  
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
    fullWidth: false,
  },
});

export interface CustomButtonProps extends ButtonProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export function Button({
  children,
  leftIcon,
  rightIcon,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  ...props
}: CustomButtonProps) {
  return (
    <CustomButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      opacity={disabled ? 0.5 : 1}
      {...props}
    >
      <XStack alignItems="center" justifyContent="center" gap="$2">
        {loading && <Spinner size={size === 'small' ? 'small' : 'large'} color="$color" />}
        {!loading && leftIcon}
        {typeof children === 'string' ? <Text>{children}</Text> : children}
        {!loading && rightIcon}
      </XStack>
    </CustomButton>
  );
} 