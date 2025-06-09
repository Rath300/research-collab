"use client";

import { Button as TamaguiButton, styled, withStaticProperties } from 'tamagui'
import { SizableText } from 'tamagui'

const ButtonFrame = styled(TamaguiButton, {
  name: 'Button',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',

  variants: {
    size: {
      '...size': (val, { tokens }) => {
        return {
          height: val,
          paddingHorizontal: tokens.space[val] ?? val,
        };
      },
    },
  } as const,

  defaultVariants: {
    size: '$4',
  },

  // Add some basic interaction styles
  '&:hover': {
    backgroundColor: '$backgroundHover',
  },

  pressStyle: {
    backgroundColor: '$backgroundPress',
  },
});

const ButtonText = styled(SizableText, {
  name: 'ButtonText',
  color: '$color',
  fontWeight: '600',
  textAlign: 'center',
});

const ButtonIcon = styled(SizableText, {
  name: 'ButtonIcon',
  color: '$color',
  marginRight: '$2', // Add some space between icon and text
});

export const Button = withStaticProperties(ButtonFrame, {
  Props: TamaguiButton.Props,
  Text: ButtonText,
  Icon: ButtonIcon,
});
