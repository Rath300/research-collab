/**
 * Environment variable validation utility
 * Validates required environment variables and provides safe access methods
 * This helps prevent accidental leakage of sensitive credentials
 */

// Configuration for environment variables
type EnvConfig = {
  name: string;
  required: boolean;
  isSecret: boolean;
  clientSide: boolean;
};

// Define all environment variables the app needs
const envConfig: Record<string, EnvConfig> = {
  // Public variables - available on client and server
  NEXT_PUBLIC_SUPABASE_URL: {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    isSecret: false,
    clientSide: true,
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    required: true,
    isSecret: false,
    clientSide: true,
  },
  NEXT_PUBLIC_SUPABASE_REDIRECT_URL: {
    name: 'NEXT_PUBLIC_SUPABASE_REDIRECT_URL',
    required: false,
    isSecret: false,
    clientSide: true,
  },
  
  // Secret variables - only available on server
  SUPABASE_SERVICE_ROLE_KEY: {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    isSecret: true,
    clientSide: false,
  },
  SUPABASE_JWT_SECRET: {
    name: 'SUPABASE_JWT_SECRET',
    required: false,
    isSecret: true,
    clientSide: false,
  },
};

/**
 * Validates that all required environment variables are present
 * Can be called during build or startup to ensure proper configuration
 */
export function validateEnv(): { valid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];
  
  Object.values(envConfig).forEach(config => {
    if (config.required && !process.env[config.name]) {
      missingVars.push(config.name);
    }
  });
  
  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * Safely gets an environment variable value
 * Prevents access to server-side secrets from client code
 */
export function getEnv(name: string): string | undefined {
  const config = envConfig[name];
  
  if (!config) {
    console.warn(`Attempted to access undefined environment variable: ${name}`);
    return undefined;
  }
  
  // Block access to secret environment variables from client-side code
  if (config.isSecret && typeof window !== 'undefined') {
    console.error(`Security issue: Attempted to access secret environment variable ${name} from client-side code`);
    return undefined;
  }
  
  return process.env[name];
}

/**
 * Logs a secure summary of environment configuration
 * Safe to use in logs as it masks sensitive values
 */
export function logEnvSummary(): void {
  if (typeof window !== 'undefined') {
    console.warn('Environment summary should only be logged server-side');
    return;
  }
  
  const summary: Record<string, string> = {};
  
  Object.values(envConfig).forEach(config => {
    const value = process.env[config.name];
    if (value) {
      if (config.isSecret) {
        // Mask secrets showing only first and last characters
        const maskLength = Math.max(value.length - 4, 0);
        const maskedValue = value.length > 4 
          ? `${value.substring(0, 2)}${'*'.repeat(maskLength)}${value.substring(value.length - 2)}`
          : '****';
        summary[config.name] = maskedValue;
      } else {
        summary[config.name] = value;
      }
    } else {
      summary[config.name] = '[not set]';
    }
  });
  
  console.log('Environment configuration:', summary);
}

// Immediately run validation on import (server-side only)
if (typeof window === 'undefined') {
  const { valid, missingVars } = validateEnv();
  if (!valid) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
} 