import { YStack, styled } from 'tamagui';
export const Card = styled(YStack, {
    backgroundColor: '$background',
    borderRadius: '$4',
    borderWidth: 1,
    borderColor: '$borderColor',
    padding: '$4',
    // Subtle elevation instead of heavy borders
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
});
//# sourceMappingURL=card.js.map