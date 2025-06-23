import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { YStack, XStack, Input, Button } from 'tamagui';
import { Send } from '@tamagui/lucide-icons';
export function MessageInput({ channelId, onSendMessage, isLoading }) {
    const [message, setMessage] = useState('');
    const handleSendMessage = async () => {
        if (!message.trim())
            return;
        try {
            await onSendMessage(message);
            setMessage('');
        }
        catch (error) {
            // Error handling would be implemented here
            console.error('Failed to send message:', error);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSendMessage();
        }
    };
    return (_jsx(YStack, { p: "$3", borderTopWidth: 1, borderColor: "$borderColor", bg: "$background", children: _jsxs(XStack, { gap: "$2", alignItems: "flex-end", children: [_jsx(Input, { flex: 1, size: "$4", placeholder: "Message this channel", value: message, onChange: (e) => setMessage(e.nativeEvent.text), onKeyPress: handleKeyPress, multiline: true, maxHeight: 120, autoCapitalize: "none", disabled: isLoading }), _jsx(Button, { size: "$3", circular: true, icon: _jsx(Send, { size: 18 }), disabled: !message.trim() || isLoading, onPress: () => void handleSendMessage() })] }) }));
}
//# sourceMappingURL=message-input.js.map