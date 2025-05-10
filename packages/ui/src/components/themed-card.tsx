import React from 'react';
import { Card, CardProps, Paragraph, H4, YStack, XStack, View, styled } from 'tamagui';

const ThemedCardHeader = styled(XStack, {
  name: 'ThemedCardHeader',
  paddingHorizontal: '$3',
  paddingTop: '$3',
  paddingBottom: '$2',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
});

const ThemedCardContent = styled(YStack, {
  name: 'ThemedCardContent',
  padding: '$3',
  gap: '$2',
});

const ThemedCardFooter = styled(XStack, {
  name: 'ThemedCardFooter',
  paddingHorizontal: '$3',
  paddingTop: '$2',
  paddingBottom: '$3',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  justifyContent: 'flex-end',
});

export interface ThemedCardProps extends CardProps {
  title?: string;
  subtitle?: string;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  elevation?: 'none' | 'small' | 'medium' | 'large';
}

export function ThemedCard({
  title,
  subtitle,
  headerContent,
  children,
  footer,
  elevation = 'small',
  ...props
}: ThemedCardProps) {
  
  const shadowProps = {
    none: {},
    small: {
      shadowColor: '$shadowColor',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '$shadowColor',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '$shadowColor',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  }[elevation];
  
  return (
    <Card
      backgroundColor="$background"
      borderRadius="$3"
      overflow="hidden"
      borderWidth={1}
      borderColor="$borderColor"
      {...shadowProps}
      {...props}
    >
      {(title || subtitle || headerContent) && (
        <ThemedCardHeader>
          <YStack flex={1}>
            {title && <H4>{title}</H4>}
            {subtitle && <Paragraph color="$gray9">{subtitle}</Paragraph>}
          </YStack>
          {headerContent && <View>{headerContent}</View>}
        </ThemedCardHeader>
      )}
      
      <ThemedCardContent>
        {children}
      </ThemedCardContent>
      
      {footer && (
        <ThemedCardFooter>
          {footer}
        </ThemedCardFooter>
      )}
    </Card>
  );
} 