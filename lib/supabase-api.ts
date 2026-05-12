import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { NextApiRequest, NextApiResponse } from 'next'
import { config } from './config'

function serializeCookie(name: string, value: string, options: CookieOptions = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`]

  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`)
  if (options.domain) parts.push(`Domain=${options.domain}`)
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)

  return parts.join('; ')
}

function appendSetCookie(res: NextApiResponse, cookie: string) {
  const current = res.getHeader('Set-Cookie')
  if (!current) {
    res.setHeader('Set-Cookie', cookie)
  } else if (Array.isArray(current)) {
    res.setHeader('Set-Cookie', [...current, cookie])
  } else {
    res.setHeader('Set-Cookie', [current.toString(), cookie])
  }
}

export function createSupabaseApiClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      get(name: string) {
        const value = req.cookies[name]
        return Array.isArray(value) ? value[0] : value
      },
      set(name: string, value: string, options: CookieOptions) {
        appendSetCookie(res, serializeCookie(name, value, options))
      },
      remove(name: string, options: CookieOptions) {
        appendSetCookie(res, serializeCookie(name, '', { ...options, maxAge: 0 }))
      },
    },
  })
}

export async function getApiUser(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseApiClient(req, res)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}
