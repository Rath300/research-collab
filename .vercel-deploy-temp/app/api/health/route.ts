import { NextResponse } from 'next/server';
import { validateEnv, logEnvSummary } from '../../../lib/envValidation';

/**
 * Health check endpoint for verifying server configuration
 * Useful for monitoring and deployment validation
 * Does not expose any sensitive information
 */
export async function GET() {
  // Log environment summary with masked secrets (server-side only)
  logEnvSummary();
  
  // Validate required environment variables
  const { valid, missingVars } = validateEnv();
  
  // For security, never return the actual variables or their values
  // Only return status information that's safe for public consumption
  if (!valid) {
    console.error(`Health check failed - missing environment variables: ${missingVars.join(', ')}`);
    return NextResponse.json({
      status: 'error',
      message: 'Missing required environment variables',
      timestamp: new Date().toISOString(),
      // Don't include missingVars in the response to avoid leaking configuration information
    }, { status: 500 });
  }
  
  // Basic database connectivity check (without exposing credentials)
  try {
    const publicVarsConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const secretVarsConfigured = process.env.SUPABASE_SERVICE_ROLE_KEY;
                                
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      // Safe configuration information that doesn't expose secrets
      config: {
        publicSupabaseConfigured: !!publicVarsConfigured,
        adminSupabaseConfigured: !!secretVarsConfigured,
        redirectUrlConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error checking system health',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 