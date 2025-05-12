"use client";

import { Button as TamaguiButton, styled } from 'tamagui'

// Define your styled button with variants
const StyledTamaguiButton = styled(TamaguiButton, {
  name: 'MyButton', // Optional: good for debugging and theming
  variants: {
    intent: {
      primary: {
        backgroundColor: '$blue10', // Example: replace with your theme tokens
        color: '$blue1',
        // Add other styles for primary variant
      },
      secondary: {
        backgroundColor: '$gray10', // Example: replace with your theme tokens
        color: '$gray1',
        // Add other styles for secondary variant
      },
      tertiary: {
        backgroundColor: 'transparent', // Example: replace with your theme tokens
        borderColor: '$gray8',
        borderWidth: 1,
        color: '$gray12',
        // Add other styles for tertiary variant
      },
    },
    // You can also define variants for 'size' if needed, mapping your 'small', 'medium', 'large'
    // to Tamagui's SizableStackProps['size'] or specific height/padding values.
    // For now, we'll pass Tamagui's size prop directly.
  } as const, // 'as const' is important for type inference of variants

  defaultVariants: {
    intent: 'primary',
  },
});

export interface ButtonProps {
  text: string
  onClick?: () => void
  intent?: 'primary' | 'secondary' | 'tertiary' // Changed from 'variant'
  size?: 'small' | 'medium' | 'large' // Corresponds to TamaguiButton size prop
  disabled?: boolean
}

export function Button({ 
  text, 
  onClick, 
  intent = 'primary',
  size = 'medium', // This will be passed to TamaguiButton's size prop
  disabled = false 
}: ButtonProps) {
  return (
    <StyledTamaguiButton
      size={size} // Use Tamagui's SizableStackProps['size']
      intent={intent} // This is your custom variant
      disabled={disabled}
      onPress={onClick}
      // Remove the direct theme prop if variants handle all styling,
      // or use it if you need to apply a different base theme dynamically
    >
      {text}
    </StyledTamaguiButton>
  )
}
