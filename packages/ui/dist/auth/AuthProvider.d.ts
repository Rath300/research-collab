import React from 'react';
interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    error: Error | null;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}
export declare function useAuth(): AuthContextType;
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map