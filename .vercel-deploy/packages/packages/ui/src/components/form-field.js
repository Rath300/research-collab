import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input, Label, Text, YStack, styled, getTokens, TextArea, SizableText } from 'tamagui';
// Styled Input with consistent theming
var ThemedInput = styled(Input, {
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
var ThemedTextArea = styled(TextArea, {
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
export function FormField(_a) {
    var label = _a.label, placeholder = _a.placeholder, value = _a.value, onChange = _a.onChange, error = _a.error, helper = _a.helper, _b = _a.required, required = _b === void 0 ? false : _b, _c = _a.multiline, multiline = _c === void 0 ? false : _c, _d = _a.numberOfLines, numberOfLines = _d === void 0 ? 3 : _d, _e = _a.autoCapitalize, autoCapitalize = _e === void 0 ? 'none' : _e, _f = _a.autoCorrect, autoCorrect = _f === void 0 ? false : _f, _g = _a.secureTextEntry, secureTextEntry = _g === void 0 ? false : _g, _h = _a.keyboardType, keyboardType = _h === void 0 ? 'default' : _h;
    var tokens = getTokens();
    var isError = !!error;
    return (_jsxs(YStack, { space: "$1.5", children: [_jsxs(Label, { htmlFor: label, fontWeight: "500", children: [label, required && _jsx(Text, { color: "$red9", children: " *" })] }), multiline ? (_jsx(ThemedTextArea, { id: label, placeholder: placeholder, value: value, onChangeText: onChange, numberOfLines: numberOfLines, autoCapitalize: autoCapitalize, autoCorrect: autoCorrect, isError: isError })) : (_jsx(ThemedInput, { id: label, placeholder: placeholder, value: value, onChangeText: onChange, autoCapitalize: autoCapitalize, autoCorrect: autoCorrect, secureTextEntry: secureTextEntry, keyboardType: keyboardType, isError: isError })), (helper || error) && (_jsx(SizableText, { size: "$1", color: isError ? '$red9' : '$gray9', children: isError ? error : helper }))] }));
}
//# sourceMappingURL=form-field.js.map