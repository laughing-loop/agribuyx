import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export const SUPER_ADMIN_EMAILS = [
  'support@agribuyx.com',
  'admin@agribuyx.com',
  'jolydoh4@gmail.com',
]

export function isSuperAdminEmail(email?: string | null) {
  if (!email) return false
  return (
    SUPER_ADMIN_EMAILS.includes(email.toLowerCase()) ||
    email.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()
  )
}

export function createSupabaseAdminClient() {
  if (!config.supabase.serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
