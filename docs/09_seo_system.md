# AgriBuyX SEO System — Documentation

## Overview

The SEO system is built on three layers:

1. **`lib/seo.ts`** — Pure utility functions (title/description generation, slug generation, alt text, reading time, canonical URL builder, price formatter)
2. **`lib/schema.ts`** — JSON-LD schema builders (Product, Article, Breadcrumb, WebSite, Organization, Category)
3. **`components/SEO.tsx`** + **`components/JsonLd.tsx`** — React components that inject metadata into `<head>` via `next/head`

---

## How Titles Are Generated

| Page | Pattern | Example |
|---|---|---|
| Product detail | `Buy {Title} in Ghana \| AgriBuyX` | `Buy Bypel 1 Organic Biopesticide in Ghana \| AgriBuyX` |
| Blog post | `{Title} \| AgriBuyX Blog` | `How to manage pests in rainy season \| AgriBuyX Blog` |
| Blog listing | `Farming Tips & Market News \| AgriBuyX Blog` | — |
| Marketplace | `Agricultural Marketplace in Ghana \| AgriBuyX` | — |
| Category | `{Category} Products in Ghana \| AgriBuyX` | `Fertilizers Products in Ghana \| AgriBuyX` |

---

## How Descriptions Are Generated

Product descriptions combine: title, category, location, and a call-to-action. Maximum 160 characters.

Blog descriptions use the post `summary` field if present, otherwise fall back to a generic pattern.

---

## Using the SEO Component

```tsx
import SEO from '@/components/SEO'

<SEO
  title="Buy Organic Fertilizer in Ghana | AgriBuyX"
  description="Find organic fertilizers from verified sellers..."
  canonical="https://agribuyx.com/products/some-slug"
  ogImage="https://res.cloudinary.com/..."
  ogType="website"          // or "article" for blog posts
  publishedTime="2024-01-15T10:00:00Z"  // article only
  modifiedTime="2024-01-20T10:00:00Z"   // article only
  noindex={false}           // set true on admin pages
/>
```

---

## Using JSON-LD

```tsx
import JsonLd from '@/components/JsonLd'
import { productSchema, breadcrumbSchema } from '@/lib/schema'

<JsonLd schema={productSchema(product)} id="product-schema" />
<JsonLd schema={breadcrumbSchema(items)} id="breadcrumb-schema" />
```

Multiple `<JsonLd>` components can be rendered on the same page. Use different `id` values to avoid key conflicts.

---

## Structured Data Types Implemented

| Schema | Pages | Rich Result |
|---|---|---|
| `Product` | `/products/[id]` | Price, availability, seller in Google Shopping |
| `BreadcrumbList` | All detail pages, category pages | Breadcrumb trail in SERPs |
| `Article` | `/blog/[slug]` | Article rich result, date, publisher |
| `WebSite` | `/products` (index) | Sitelinks searchbox in Google |
| `Organization` | `/products` (index) | Knowledge panel |
| `CollectionPage` | `/categories/[slug]` | Category page signal |

---

## Verifying Rich Results

1. Go to https://search.google.com/test/rich-results
2. Enter any product or blog post URL
3. Should show "Product" or "Article" detected with no errors

---

## Environment Variables Required

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Base URL e.g. `https://agribuyx.com` (used for canonicals, sitemap) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console verification meta tag value |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster Tools verification meta tag value |

All three are **optional** — if not set, no errors occur (tags simply don't render).
