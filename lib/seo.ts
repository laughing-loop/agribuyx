/**
 * AgriBuyX SEO Utility Library
 * Centralised SEO string generation — titles, descriptions, canonical URLs, alt text
 * All functions are pure and side-effect free.
 */

const APP_NAME = 'AgriBuyX'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agribuyx.com'
const COUNTRY = 'Ghana'

// ─── URL Builder ──────────────────────────────────────────────────────────────

export function getBaseUrl(): string {
  return APP_URL.replace(/\/$/, '')
}

export function canonicalUrl(path: string): string {
  const base = getBaseUrl()
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${base}${clean}`
}

function cleanLocation(location?: string | null): string {
  return (location || '').trim().replace(/\s*,\s*/g, ', ')
}

// ─── Slug Generator ───────────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from a product title.
 * e.g. "Bypel 1 Organic Biopesticide!" → "bypel-1-organic-biopesticide"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special chars except hyphens
    .replace(/[\s_]+/g, '-')     // spaces/underscores → hyphens
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')     // trim leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a short suffix if needed.
 * suffix should be the first 6 chars of the product ID.
 */
export function generateUniqueSlug(title: string, idSuffix: string): string {
  const base = generateSlug(title)
  return `${base}-${idSuffix}`
}

// ─── Product SEO ──────────────────────────────────────────────────────────────

export interface ProductSeoInput {
  title: string
  category?: string | null
  location?: string | null
  description?: string | null
  price?: number | string | null
  condition?: string | null
  vendorName?: string | null
}

/**
 * Generate an SEO title for a product page.
 * Format: "{Title} in {Location}, Ghana | AgriBuyX"
 */
export function productSeoTitle(product: ProductSeoInput): string {
  const title = product.title?.trim() || 'Agricultural Product'
  const location = cleanLocation(product.location)
  const place = location ? `${location}, ${COUNTRY}` : COUNTRY
  return `${title} in ${place} | ${APP_NAME}`
}

/**
 * Generate an SEO meta description for a product page.
 * ~150 chars, keyword-rich, action-oriented.
 */
export function productSeoDescription(product: ProductSeoInput): string {
  const title = product.title?.trim() || 'Agricultural Product'
  const location = cleanLocation(product.location)
  const category = product.category?.trim()
  const vendor = product.vendorName?.trim()
  const price = Number(product.price)
  const hasPrice = Number.isFinite(price) && price > 0
  const place = location ? `${location}, ${COUNTRY}` : COUNTRY

  const parts: string[] = [`Buy ${title} in ${place} on ${APP_NAME}.`]

  if (product.description?.trim()) {
    parts.push(product.description.trim())
  }

  if (hasPrice) {
    parts.push(formatPriceGHS(product.price) + '.')
  }

  if (vendor) {
    parts.push(`Listed by ${vendor}.`)
  } else if (category) {
    parts.push(`Category: ${category}.`)
  }

  parts.push('Contact the seller directly.')

  return parts.join(' ').slice(0, 160)
}

/**
 * Generate alt text for a product image.
 * Format: "{Title} for sale in {Country} on AgriBuyX"
 */
export function productImageAlt(product: ProductSeoInput, index = 0): string {
  const title = product.title?.trim() || 'Agricultural product'
  const location = cleanLocation(product.location)
  const suffix = location ? `in ${location}, ${COUNTRY}` : `in ${COUNTRY}`
  const imageLabel = index > 0 ? ` — image ${index + 1}` : ''
  return `${title} for sale ${suffix} on ${APP_NAME}${imageLabel}`
}

// ─── Blog SEO ─────────────────────────────────────────────────────────────────

export interface BlogSeoInput {
  title: string
  summary?: string | null
  created_at?: string
  image_url?: string | null
}

/**
 * Generate an SEO title for a blog post.
 * Format: "{Title} | AgriBuyX Blog"
 */
export function blogSeoTitle(post: BlogSeoInput): string {
  const title = post.title?.trim() || 'Farming Tips'
  return `${title} | ${APP_NAME} Blog`
}

/**
 * Generate an SEO meta description for a blog post.
 */
export function blogSeoDescription(post: BlogSeoInput): string {
  if (post.summary?.trim()) {
    return post.summary.trim().slice(0, 160)
  }
  const title = post.title?.trim() || 'Farming tips'
  return `${title} — practical farming tips, market news, and agricultural insights from ${APP_NAME}.`
}

/**
 * Calculate estimated reading time from markdown/text content.
 * Returns e.g. "4 min read"
 */
export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

// ─── Category SEO ─────────────────────────────────────────────────────────────

export interface CategorySeoInput {
  name: string
  description?: string | null
  slug?: string | null
}

export function categorySeoTitle(category: CategorySeoInput): string {
  return `${category.name} in ${COUNTRY} | ${APP_NAME}`
}

export function categorySeoDescription(category: CategorySeoInput): string {
  if (category.description?.trim()) {
    return category.description.trim().slice(0, 160)
  }
  return `Browse ${category.name} in ${COUNTRY} on ${APP_NAME}. Find trusted sellers, compare listings, and contact vendors directly.`
}

// ─── Marketplace Page SEO ─────────────────────────────────────────────────────

export const marketplaceSeoTitle = `Agricultural Marketplace in ${COUNTRY} | ${APP_NAME}`
export const marketplaceSeoDescription = `Find seeds, fertilizers, crop protection, livestock supplies, and farm equipment from trusted vendors in ${COUNTRY}. Contact sellers directly on ${APP_NAME}.`

// ─── Blog Listing SEO ─────────────────────────────────────────────────────────

export const blogListingSeoTitle = `Farming Tips & Market News | ${APP_NAME} Blog`
export const blogListingSeoDescription = `Practical farming tips, agricultural market updates, and news for farmers in ${COUNTRY}. Read the latest on ${APP_NAME}.`

// ─── Price Formatter ──────────────────────────────────────────────────────────

export function formatPriceGHS(price?: number | string | null): string {
  const value = Number(price)
  if (!Number.isFinite(value) || value <= 0) return 'Contact for price'
  return `GHS ${value.toLocaleString('en-GH')}`
}

// ─── Condition Mapper ─────────────────────────────────────────────────────────

/**
 * Map product condition to schema.org ItemCondition
 */
export function mapConditionToSchema(condition?: string | null): string {
  const c = (condition || '').toLowerCase()
  if (c.includes('new')) return 'https://schema.org/NewCondition'
  if (c.includes('refurb') || c.includes('renew')) return 'https://schema.org/RefurbishedCondition'
  if (c.includes('used') || c.includes('second')) return 'https://schema.org/UsedCondition'
  return 'https://schema.org/NewCondition'
}
