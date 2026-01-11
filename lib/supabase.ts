import { createBrowserClient } from '@supabase/ssr'
import { config } from './config'

export const supabase = createBrowserClient(
    config.supabase.url,
    config.supabase.anonKey
)
