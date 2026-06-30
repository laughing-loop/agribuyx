export type MarketplaceSocialLinks = {
  whatsapp_channel_url?: string
  whatsapp_url?: string
  tiktok_url?: string
  facebook_url?: string
  instagram_url?: string
}

const allowedHosts = {
  whatsapp: ['wa.me', 'whatsapp.com', 'www.whatsapp.com', 'api.whatsapp.com', 'chat.whatsapp.com'],
  tiktok: ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'web.facebook.com', 'fb.com'],
  instagram: ['instagram.com', 'www.instagram.com'],
}

function isAllowedHost(hostname: string, hosts: string[]) {
  const normalized = hostname.toLowerCase()
  return hosts.some((host) => normalized === host || normalized.endsWith(`.${host}`))
}

export function sanitizeExternalUrl(value: unknown, hosts: string[]): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:') return undefined
    if (!isAllowedHost(parsed.hostname, hosts)) return undefined
    return parsed.toString()
  } catch {
    return undefined
  }
}

export function sanitizeMarketplaceSocialLinks(links: MarketplaceSocialLinks = {}): MarketplaceSocialLinks {
  return {
    whatsapp_channel_url: sanitizeExternalUrl(links.whatsapp_channel_url, allowedHosts.whatsapp),
    whatsapp_url: sanitizeExternalUrl(links.whatsapp_url, allowedHosts.whatsapp),
    tiktok_url: sanitizeExternalUrl(links.tiktok_url, allowedHosts.tiktok),
    facebook_url: sanitizeExternalUrl(links.facebook_url, allowedHosts.facebook),
    instagram_url: sanitizeExternalUrl(links.instagram_url, allowedHosts.instagram),
  }
}

export function sanitizeSocialMap(map: Record<string, string>): Record<string, string> {
  const sanitized = sanitizeMarketplaceSocialLinks({
    whatsapp_channel_url: map.whatsapp_channel_url,
    whatsapp_url: map.whatsapp_url,
    tiktok_url: map.tiktok_url,
    facebook_url: map.facebook_url,
    instagram_url: map.instagram_url,
  })

  return Object.fromEntries(
    Object.entries(sanitized).filter((entry): entry is [string, string] => Boolean(entry[1]))
  )
}
