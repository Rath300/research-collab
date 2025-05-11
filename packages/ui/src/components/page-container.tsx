import React from 'react';
import { ScrollView, YStack, styled, XStack, H2, Button, SizableText } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BeeIcon } from './bee-icon';

const StyledSafeAreaView = styled(SafeAreaView, {
  name: 'StyledSafeAreaView',
  flex: 1,
  backgroundColor: '$background',
});

const ContentContainer = styled(YStack, {
  name: 'ContentContainer',
  flex: 1,
  padding: '$4',
  paddingBottom: '$8',
});

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  scrollable?: boolean;
  headerRight?: React.ReactNode;
  paddingHorizontal?: number | string;
  paddingVertical?: number | string;
  backgroundColor?: string;
}

export function PageContainer({
  children,
  title,
  showHeader = true,
  showBackButton = false,
  onBackPress,
  scrollable = true,
  headerRight,
  paddingHorizontal = '$4',
  paddingVertical = '$4',
  backgroundColor = '$background',
}: PageContainerProps) {
  const content = (
    <ContentContainer
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
      backgroundColor={backgroundColor}
    >
      {children}
    </ContentContainer>
  );

  return (
    <StyledSafeAreaView>
      {showHeader && (
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$2.5"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          backgroundColor="$backgroundHover"
        >
          {showBackButton && (
            <Button
              chromeless
              paddingRight="$2"
              onPress={onBackPress}
              icon={<SizableText fontSize="$5">←</SizableText>}
            />
          )}
          
          {title ? (
            <H2 flex={1} textAlign="center">
              {title}
            </H2>
          ) : (
            <XStack flex={1} justifyContent="center" alignItems="center" gap="$2">
              <BeeIcon size={24} />
              <H2>Research Bee</H2>
            </XStack>
          )}
          
          {headerRight ? (
            <XStack>{headerRight}</XStack>
          ) : (
            <XStack width={showBackButton ? 24 : 0} />
          )}
        </XStack>
      )}

      {scrollable ? <ScrollView flex={1}>{content}</ScrollView> : content}
    </StyledSafeAreaView>
  );
} 