var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// Import the Supabase client from the standard package
import { createClient } from '@supabase/supabase-js';
/**
 * Custom error class for Supabase operations
 * Provides consistent error handling across the application
 */
var SupabaseError = /** @class */ (function (_super) {
    __extends(SupabaseError, _super);
    function SupabaseError(message, status, code) {
        if (status === void 0) { status = 400; }
        var _this = _super.call(this, message) || this;
        _this.name = 'SupabaseError';
        _this.status = status;
        _this.code = code;
        return _this;
    }
    return SupabaseError;
}(Error));
export { SupabaseError };
// Environment variables with proper validation
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Early validation of required environment variables
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    console.error('Missing Supabase environment variables');
}
// Singleton instance for the Supabase client
var instance = null;
/**
 * Creates a properly configured Supabase client with type safety
 */
function createSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new SupabaseError('Missing Supabase environment variables', 500);
    }
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    });
}
/**
 * Returns the singleton Supabase client instance or creates it if it doesn't exist
 */
export function getSupabaseClient() {
    if (instance)
        return instance;
    instance = createSupabaseClient();
    return instance;
}
/**
 * Returns the singleton browser-side Supabase client
 * Alias for getSupabaseClient for API compatibility
 */
export function getBrowserClient() {
    return getSupabaseClient();
}
/**
 * Resets the Supabase client instance
 * Useful for testing or when auth state changes
 */
export function resetSupabaseClient() {
    instance = null;
}
/**
 * Creates a new Supabase client instance
 * Useful for server-side operations that need isolated clients
 */
export function createNewClient() {
    return createSupabaseClient();
}
