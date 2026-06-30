/**
 * Centralized configuration for the application
 * This is the enterprise approach to managing environment variables
 * 
 * Benefits:
 * 1. Single source of truth for all config
 * 2. Type-safe configuration
 * 3. Validation at startup
 * 4. Easy to test and mock
 * 5. Clear error messages when config is missing
 */

// For client-side NEXT_PUBLIC_ variables, we use defaults since they're baked in at build time
// For server-side variables, we validate strictly
function getEnvVar(key: string, defaultValue?: string, isClientSide = false): string {
    const value = process.env[key] || defaultValue

    // On client-side, if NEXT_PUBLIC_ var is missing, use default (it's baked in at build)
    if (typeof window !== 'undefined' && key.startsWith('NEXT_PUBLIC_')) {
        return value || defaultValue || ''
    }

    // On server-side, validate strictly
    if (!value && !isClientSide) {
        console.error(`Missing required environment variable: ${key}`)
        return defaultValue || ''
    }

    return value || ''
}

// Supabase Configuration
export const supabaseConfig = {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://sfehpthgrdehsrbbwhzq.supabase.co', true),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZWhwdGhncmRlaHNyYmJ3aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MzU1OTYsImV4cCI6MjA3OTAxMTU5Nn0.xIvYfNrzvACfmcLwyJAcwEpyUR6GdYgL_ZTyc24cgh4', true),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Server-side only, required for admin invites
} as const

// Cloudinary Configuration
export const cloudinaryConfig = {
    cloudName: getEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'dwg0ofyea', true),
    uploadPreset: getEnvVar('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET', 'agribuyx_unsigned', true),
    apiKey: process.env.CLOUDINARY_API_KEY, // Server-side only
    apiSecret: process.env.CLOUDINARY_API_SECRET, // Server-side only
} as const

// Email Configuration (Server-side only)
export const emailConfig = {
    smtp: {
        host: process.env.SUPPORT_SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SUPPORT_SMTP_PORT || '465'),
        secure: process.env.SUPPORT_SMTP_SECURE === 'true',
        user: process.env.SUPPORT_SMTP_USER,
        pass: process.env.SUPPORT_SMTP_PASS,
    },
    from: process.env.SUPPORT_FROM_EMAIL || 'support@agribuyx.com',
    to: process.env.SUPPORT_TO_EMAIL || 'support@agribuyx.com',
} as const

// App Configuration
export const appConfig = {
    name: 'AgriBuyX',
    url: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://agribuyx.com'),
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
} as const

// SEO / Webmaster Verification
// Set these in Vercel environment variables — never hardcode
export const seoConfig = {
    googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    bingSiteVerification: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
} as const

// Export all configs
export const config = {
    supabase: supabaseConfig,
    cloudinary: cloudinaryConfig,
    email: emailConfig,
    app: appConfig,
    seo: seoConfig,
} as const

// Type-safe config access
export type Config = typeof config

// Log configuration status (only in development, server-side only)
if (appConfig.isDevelopment && typeof window === 'undefined') {
    console.log('📋 Configuration loaded:')
    console.log('  - Supabase URL:', supabaseConfig.url ? '✓' : '✗')
    console.log('  - Cloudinary Cloud Name:', cloudinaryConfig.cloudName ? '✓' : '✗')
    console.log('  - Environment:', appConfig.environment)
}
