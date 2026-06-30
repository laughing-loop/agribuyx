/**
 * SEO Head Component
 * Drop-in <head> metadata for every public page.
 * Uses next/head — compatible with Pages Router.
 *
 * Usage:
 *   <SEO
 *     title="Buy Bypel 1 Organic Biopesticide in Ghana | AgriBuyX"
 *     description="Buy Bypel 1 Organic Biopesticide..."
 *     canonical="https://agribuyx.com/products/bypel-1-organic-biopesticide"
 *     ogImage="https://res.cloudinary.com/..."
 *   />
 */

import Head from 'next/head'
import { getBaseUrl } from '@/lib/seo'

const APP_NAME = 'AgriBuyX'
const BASE_URL = getBaseUrl()
const DEFAULT_OG_IMAGE = `${BASE_URL}/OG_image.png`

interface SEOProps {
  /** Full page title, already formatted (do not append site name again) */
  title: string
  /** Meta description, max ~155 chars */
  description: string
  /** Canonical URL — full absolute URL */
  canonical?: string
  /** OG image URL — full absolute URL or Cloudinary URL */
  ogImage?: string | null
  /** og:type — defaults to "website", use "article" for blog posts */
  ogType?: 'website' | 'article'
  /** article:published_time ISO string — for blog posts */
  publishedTime?: string
  /** article:modified_time ISO string — for blog posts */
  modifiedTime?: string
  /** noindex — set true on admin/private pages */
  noindex?: boolean
  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image'
}

export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  noindex = false,
  twitterCard = 'summary_large_image',
}: SEOProps) {
  const resolvedImage = ogImage || DEFAULT_OG_IMAGE
  const resolvedCanonical = canonical || BASE_URL

  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION

  return (
    <Head>
      {/* Primary */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={resolvedCanonical} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* OpenGraph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:locale" content="en_GH" />

      {/* Article-specific OG (blog posts) */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && (
        <meta property="article:publisher" content={BASE_URL} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:site" content="@agribuyx" />

      {/* Search Console Verification */}
      {googleVerification && (
        <meta name="google-site-verification" content={googleVerification} />
      )}
      {bingVerification && (
        <meta name="msvalidate.01" content={bingVerification} />
      )}
    </Head>
  )
}
