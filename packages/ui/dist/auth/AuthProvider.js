import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@research-collab/db/auth';
const AuthContext = createContext(undefined);
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const refreshUser = async () => {
        try {
            setIsLoading(true);
            const user = await getCurrentUser();
            setUser(user);
        }
        catch (err) {
            console.error('Error getting current user:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            await signOut();
            setUser(null);
        }
        catch (err) {
            console.error('Error signing out:', err);
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        refreshUser();
    }, []);
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isLoading,
            error,
            signOut: handleSignOut,
            refreshUser,
        }, children: children }));
}
//# sourceMappingURL=AuthProvider.js.map