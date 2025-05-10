interface MessageInputProps {
    channelId: string;
    onSendMessage: (text: string) => Promise<void>;
    isLoading: boolean;
}
export declare function MessageInput({ channelId, onSendMessage, isLoading }: MessageInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=message-input.d.ts.map