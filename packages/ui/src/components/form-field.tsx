import React from 'react';
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

export interface FormFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
}

export function FormField({
  label,
  placeholder,
  value,
  onChange,
  error,
  helper,
  required = false,
  multiline = false,
  numberOfLines = 3,
  autoCapitalize = 'none',
  autoCorrect = false,
  secureTextEntry = false,
  keyboardType = 'default',
}: FormFieldProps) {
  const tokens = getTokens();
  const isError = !!error;
  
  return (
    <YStack space="$1.5">
      <Label htmlFor={label} fontWeight="500">
        {label}
        {required && <Text color="$red9"> *</Text>}
      </Label>
      
      {multiline ? (
        <ThemedTextArea
          id={label}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          isError={isError}
        />
      ) : (
        <ThemedInput
          id={label}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          isError={isError}
        />
      )}
      
      {(helper || error) && (
        <SizableText size="$1" color={isError ? '$red9' : '$gray9'}>
          {isError ? error : helper}
        </SizableText>
      )}
    </YStack>
  );
} 