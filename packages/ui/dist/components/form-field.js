import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input, Label, Text, YStack, styled, getTokens, TextArea, SizableText } from 'tamagui';
// Styled Input with consistent theming
const ThemedInput = styled(Input, {
    name: 'ThemedInput',
    borderWidth: 1,
    borderColor: '$borderColor',
    backgroundColor: '$backgroundHover',
    color: '$color',
    focusStyle: {
        borderColor: '$researchbeeYellow',
        outlineColor: '$researchbeeYellow',
        outlineWidth: 1,
        outlineStyle: 'solid',
    },
    variants: {
        isError: {
            true: {
                borderColor: '$red9',
                color: '$red9',
            },
        },
    },
});
// Styled TextArea with consistent theming
const ThemedTextArea = styled(TextArea, {
    name: 'ThemedTextArea',
    borderWidth: 1,
    borderColor: '$borderColor',
    backgroundColor: '$backgroundHover',
    color: '$color',
    focusStyle: {
        borderColor: '$researchbeeYellow',
        outlineColor: '$researchbeeYellow',
        outlineWidth: 1,
        outlineStyle: 'solid',
    },
    variants: {
        isError: {
            true: {
                borderColor: '$red9',
                color: '$red9',
            },
        },
    },
});
export function FormField({ label, placeholder, value, onChange, error, helper, required = false, multiline = false, numberOfLines = 3, autoCapitalize = 'none', autoCorrect = false, secureTextEntry = false, keyboardType = 'default', }) {
    const tokens = getTokens();
    const isError = !!error;
    return (_jsxs(YStack, { space: "$1.5", children: [_jsxs(Label, { htmlFor: label, fontWeight: "500", children: [label, required && _jsx(Text, { color: "$red9", children: " *" })] }), multiline ? (_jsx(ThemedTextArea, { id: label, placeholder: placeholder, value: value, onChangeText: onChange, numberOfLines: numberOfLines, autoCapitalize: autoCapitalize, autoCorrect: autoCorrect, isError: isError })) : (_jsx(ThemedInput, { id: label, placeholder: placeholder, value: value, onChangeText: onChange, autoCapitalize: autoCapitalize, autoCorrect: autoCorrect, secureTextEntry: secureTextEntry, keyboardType: keyboardType, isError: isError })), (helper || error) && (_jsx(SizableText, { size: "$1", color: isError ? '$red9' : '$gray9', children: isError ? error : helper }))] }));
}
//# sourceMappingURL=form-field.js.map