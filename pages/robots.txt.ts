/**
 * Robots.txt — pages/robots.txt.ts
 *
 * Dynamic robots.txt served via Next.js Pages Router.
 * Allows public marketplace pages, blocks admin/auth routes.
 * References the dynamic sitemap.
 *
 * Access: GET /robots.txt
 */

import type { GetServerSideProps } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agribuyx.com'

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robots = `# AgriBuyX Robots.txt
# Generated: ${new Date().toISOString().split('T')[0]}

User-agent: *

# Allow public marketplace pages
Allow: /
Allow: /products
Allow: /products/
Allow: /blog
Allow: /blog/
Allow: /categories
Allow: /categories/

# Block admin, auth, and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /admin/login
Disallow: /admin/update-password
Disallow: /admin/vendors
Disallow: /admin/dashboard
Disallow: /admin/dashboard-v2

# Block internal Next.js paths
Disallow: /_next/
Disallow: /static/

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml
`

  res.setHeader('Content-Type', 'text/plain; charset=UTF-8')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400')
  res.write(robots)
  res.end()

  return { props: {} }
}

export default function RobotsPage() {
  return null
}
