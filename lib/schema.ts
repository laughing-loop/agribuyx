/**
 * AgriBuyX JSON-LD Schema Builders
 * Returns structured data objects for Google rich results.
 * All builders return plain objects — render via <JsonLd> component.
 *
 * References:
 *  - https://schema.org/Product
 *  - https://schema.org/BreadcrumbList
 *  - https://schema.org/Article
 *  - https://schema.org/WebSite
 *  - https://schema.org/Organization
 */

import { getBaseUrl, canonicalUrl, mapConditionToSchema } from './seo'

const APP_NAME = 'AgriBuyX'
const APP_URL = getBaseUrl()

// ─── Website Schema ────────────────────────────────────────────────────────────

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    url: APP_URL,
    description: 'Agricultural marketplace in Ghana for farm inputs, equipment, and crop protection products.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_URL}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ─── Organization Schema ───────────────────────────────────────────────────────

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    url: APP_URL,
    logo: `${APP_URL}/agribuyx_logo-02.svg`,
    description: 'Agricultural marketplace in Ghana for farm inputs, equipment, and agricultural products.',
    areaServed: {
      '@type': 'Country',
      name: 'Ghana',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@agribuyx.com',
      availableLanguage: ['English'],
    },
    sameAs: [],
  }
}

// ─── SiteNavigationElement Schema ──────────────────────────────────────────────

export function siteNavigationElementSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'SiteNavigationElement', position: 1, name: 'Marketplace', url: canonicalUrl('/products') },
      { '@type': 'SiteNavigationElement', position: 2, name: 'Farm Machinery & Equipment', url: canonicalUrl('/categories/farm-machinery-equipment') },
      { '@type': 'SiteNavigationElement', position: 3, name: 'Seeds', url: canonicalUrl('/categories/seeds') },
      { '@type': 'SiteNavigationElement', position: 4, name: 'Fertilizers', url: canonicalUrl('/categories/fertilizers') },
      { '@type': 'SiteNavigationElement', position: 5, name: 'Crop Protection', url: canonicalUrl('/categories/crop-protection') },
      { '@type': 'SiteNavigationElement', position: 6, name: 'Livestock Supplies', url: canonicalUrl('/categories/livestock-supplies') },
      { '@type': 'SiteNavigationElement', position: 7, name: 'Irrigation & Watering', url: canonicalUrl('/categories/irrigation-watering') },
      { '@type': 'SiteNavigationElement', position: 8, name: 'Blog', url: canonicalUrl('/blog') },
      { '@type': 'SiteNavigationElement', position: 9, name: 'Vendor Office', url: canonicalUrl('/admin/login') },
    ]
  }
}

// ─── Breadcrumb Schema ─────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// ─── Product Schema ────────────────────────────────────────────────────────────

export interface ProductSchemaInput {
  id: string
  title: string
  description?: string | null
  price?: number | string | null
  image_url?: string | null
  images?: string[]
  category?: string | null
  condition?: string | null
  location?: string | null
  slug?: string | null
  created_at?: string
  vendor_name?: string | null
}

export function productSchema(product: ProductSchemaInput) {
  const productUrl = product.slug
    ? canonicalUrl(`/products/${product.slug}`)
    : canonicalUrl(`/products/${product.id}`)

  const imageList: string[] = []
  if (product.images && product.images.length > 0) {
    imageList.push(...product.images)
  } else if (product.image_url) {
    imageList.push(product.image_url)
  }

  const priceValue = Number(product.price)
  const hasValidPrice = Number.isFinite(priceValue) && priceValue > 0

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    alternateName: product.title,
    sku: product.id,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: product.vendor_name || APP_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Ghana',
    },
  }

  if (product.description) {
    schema.description = product.description
  }

  if (product.category) {
    schema.category = product.category
  }

  if (product.condition) {
    schema.itemCondition = mapConditionToSchema(product.condition)
  }

  if (imageList.length > 0) {
    schema.image = imageList
  }

  if (hasValidPrice) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: priceValue.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: productUrl,
      itemCondition: mapConditionToSchema(product.condition),
      seller: {
        '@type': 'Organization',
        name: product.vendor_name || APP_NAME,
      },
      areaServed: {
        '@type': 'Country',
        name: 'Ghana',
      },
    }
    if (product.location) {
      ;(schema.offers as Record<string, unknown>).availableAtOrFrom = {
        '@type': 'Place',
        name: product.location,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'GH',
          addressLocality: product.location,
        },
      }
    }
  }

  return schema
}

// ─── Article Schema (Blog) ─────────────────────────────────────────────────────

export interface ArticleSchemaInput {
  title: string
  slug: string
  summary?: string | null
  content?: string | null
  image_url?: string | null
  created_at: string
  updated_at?: string | null
}

export function articleSchema(post: ArticleSchemaInput) {
  const articleUrl = canonicalUrl(`/blog/${post.slug}`)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    url: articleUrl,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Organization',
      name: APP_NAME,
      url: APP_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: APP_NAME,
      url: APP_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/agribuyx_logo-02.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  }

  if (post.summary) {
    schema.description = post.summary
  }

  if (post.image_url) {
    schema.image = {
      '@type': 'ImageObject',
      url: post.image_url,
    }
  }

  return schema
}

// ─── Category/CollectionPage Schema ───────────────────────────────────────────

export interface CategorySchemaInput {
  name: string
  description?: string | null
  slug: string
  productCount?: number
}

export function categorySchema(category: CategorySchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Products in Ghana`,
    url: canonicalUrl(`/categories/${category.slug}`),
    description: category.description || `Browse ${category.name} products from verified sellers in Ghana on ${APP_NAME}.`,
    numberOfItems: category.productCount,
    provider: {
      '@type': 'Organization',
      name: APP_NAME,
      url: APP_URL,
    },
  }
}
