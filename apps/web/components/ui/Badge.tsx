'use client';

import React from 'react';
import { styled, YStack, Text } from 'tamagui';
import { type VariantProps } from 'class-variance-authority';

const BadgeFrame = styled(YStack, {
  name: 'Badge',
  borderRadius: '$12',
  paddingVertical: '$1.5',
  paddingHorizontal: '$3',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'inline-flex',

  variants: {
    variant: {
      default: {
        backgroundColor: '$gray5',
        borderColor: '$gray7',
        borderWidth: 1,
      },
      primary: {
        backgroundColor: '$blue5',
        borderColor: '$blue7',
        borderWidth: 1,
      },
      secondary: {
        backgroundColor: '$purple5',
        borderColor: '$purple7',
        borderWidth: 1,
      },
      success: {
        backgroundColor: '$green5',
        borderColor: '$green7',
        borderWidth: 1,
      },
      destructive: {
        backgroundColor: '$red5',
        borderColor: '$red7',
        borderWidth: 1,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$gray8',
        borderWidth: 1,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
  },
});

const BadgeText = styled(Text, {
  name: 'BadgeText',
  fontSize: '$2',
  fontWeight: '600',
  lineHeight: '$2',
  userSelect: 'none',

  variants: {
    variant: {
      default: {
        color: '$gray11',
      },
      primary: {
        color: '$blue11',
      },
      secondary: {
        color: '$purple11',
      },
      success: {
        color: '$green11',
      },
      destructive: {
        color: '$red11',
      },
      outline: {
        color: '$gray11',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof BadgeFrame>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<
  React.ElementRef<typeof BadgeFrame>,
  BadgeProps
>(({ children, variant, ...props }, ref) => {
  return (
    <BadgeFrame ref={ref} variant={variant} {...props}>
      <BadgeText variant={variant}>{children}</BadgeText>
    </BadgeFrame>
  );
});

Badge.displayName = 'Badge';

// Helper to define variants for both frame and text
const badgeVariants = (props: any) => ({
    variant: props.variant,
});

export { Badge, badgeVariants }; 