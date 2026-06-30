/**
 * Dynamic Sitemap — pages/sitemap.xml.ts
 *
 * Pulls live data from Supabase and generates a valid XML sitemap.
 * Includes: homepage, products listing, all active products,
 *           blog listing, all published blog posts, categories.
 *
 * Access: GET /sitemap.xml
 * Submit to Google: https://search.google.com/search-console
 * Submit to Bing:   https://www.bing.com/webmasters
 */

import type { GetServerSideProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import { CANONICAL_CATEGORIES } from '@/lib/categoryMap'

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://agribuyx.com').replace(/\/$/, '')

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function url(
  loc: string,
  options: {
    lastmod?: string
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority?: string
  } = {}
): string {
  const { lastmod, changefreq = 'weekly', priority = '0.5' } = options
  return `
  <url>
    <loc>${xmlEscape(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod.split('T')[0]}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

function generateSitemap(urls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const today = new Date().toISOString()
  const urls: string[] = []

  // ── Static pages ──────────────────────────────────────────────────────────

  urls.push(url(`${BASE_URL}`, { changefreq: 'daily', priority: '1.0', lastmod: today }))
  urls.push(url(`${BASE_URL}/products`, { changefreq: 'hourly', priority: '0.9', lastmod: today }))
  urls.push(url(`${BASE_URL}/blog`, { changefreq: 'daily', priority: '0.8', lastmod: today }))
  CANONICAL_CATEGORIES.forEach((category) => {
    urls.push(url(`${BASE_URL}/categories/${category.slug}`, {
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: today,
    }))
  })

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── Products ──────────────────────────────────────────────────────────────

  const { data: products } = await supabaseServer
    .from('products')
    .select('id, slug, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(50000)

  if (products) {
    for (const product of products) {
      const path = product.slug
        ? `${BASE_URL}/products/${product.slug}`
        : `${BASE_URL}/products/${product.id}`
      urls.push(url(path, {
        lastmod: product.updated_at || product.created_at,
        changefreq: 'weekly',
        priority: '0.8',
      }))
    }
  }

  // ── Blog posts ────────────────────────────────────────────────────────────

  const { data: blogPosts } = await supabaseServer
    .from('blog_posts')
    .select('slug, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(10000)

  if (blogPosts) {
    for (const post of blogPosts) {
      urls.push(url(`${BASE_URL}/blog/${post.slug}`, {
        lastmod: post.updated_at || post.created_at,
        changefreq: 'weekly',
        priority: '0.7',
      }))
    }
  }

  // ── Render XML ────────────────────────────────────────────────────────────

  const sitemap = generateSitemap(urls)

  res.setHeader('Content-Type', 'application/xml; charset=UTF-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(sitemap)
  res.end()

  return { props: {} }
}

// Required — Next.js needs a default export for pages
export default function SitemapPage() {
  return null
}
