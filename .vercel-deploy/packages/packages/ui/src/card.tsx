import { Card as TamaguiCard, H2, Paragraph, XStack, YStack } from 'tamagui'

export interface CardProps {
  title: string
  description: string
  footer?: string
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ title, description, footer, variant = 'default' }: CardProps) {
  return (
    <TamaguiCard
      elevate
      bordered={variant === 'outlined'}
      elevation={variant === 'elevated' ? '$4' : undefined}
      size="$4"
      borderRadius="$4"
      padding="$4"
    >
      <YStack space="$2">
        <H2>{title}</H2>
        <Paragraph>{description}</Paragraph>
        {footer && (
          <XStack marginTop="$2">
            <Paragraph size="$2" opacity={0.7}>{footer}</Paragraph>
          </XStack>
        )}
      </YStack>
    </TamaguiCard>
  )
}
