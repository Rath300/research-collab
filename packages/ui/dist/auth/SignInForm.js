import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { signIn } from '@research-collab/db/auth';
export function SignInForm({ onSuccess, onError }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await signIn(email, password);
            if (error) {
                setError(error.message);
                onError?.(error);
            }
            else {
                onSuccess?.();
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm" })] }), error && (_jsx("div", { className: "text-red-500 text-sm", children: error })), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: loading ? 'Signing in...' : 'Sign in' })] }));
}
//# sourceMappingURL=SignInForm.js.map