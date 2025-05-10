"use client";

import { Button as TamaguiButton } from 'tamagui'

export interface ButtonProps {
  text: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

export function Button({ 
  text, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  disabled = false 
}: ButtonProps) {
  return (
    <TamaguiButton
      size={size}
      theme={variant}
      disabled={disabled}
      onPress={onClick}
    >
      {text}
    </TamaguiButton>
  )
}
