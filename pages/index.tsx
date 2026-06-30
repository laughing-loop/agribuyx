import { useState, useEffect } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import SEO from '@/components/SEO'
import JsonLd from '@/components/JsonLd'
import MarketplaceFooter from '@/components/MarketplaceFooter'
import { canonicalUrl, formatPriceGHS } from '@/lib/seo'
import { organizationSchema, websiteSchema, siteNavigationElementSchema } from '@/lib/schema'
import { getThumbnailUrl } from '@/lib/cloudinary'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  title: string
  price?: number | string | null
  location?: string | null
  image_url?: string | null
  slug?: string | null
}

interface Props {
  featuredProducts: Product[]
}

// ─── SSR ──────────────────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch a few recent/featured products for the homepage section
  const { data: products } = await supabaseServer
    .from('products')
    .select('id, title, price, location, image_url, slug')
    .order('created_at', { ascending: false })
    .limit(4)

  return {
    props: {
      featuredProducts: products || [],
    },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Homepage({ featuredProducts }: Props) {
  const seoTitle = 'AgriBuyX | Agricultural Marketplace in Ghana'
  const seoDescription = 'AgriBuyX is an agricultural marketplace in Ghana for seeds, fertilizers, crop protection, livestock supplies, farm machinery, and equipment from trusted vendors.'
  const canonical = canonicalUrl('/')

  const productUrl = (p: Product) => p.slug ? `/products/${p.slug}` : `/products/${p.id}`

  const categoryLinks = [
    { name: 'Farm Machinery & Equipment', slug: 'farm-machinery-equipment', icon: '🚜' },
    { name: 'Seeds', slug: 'seeds', icon: '🌱' },
    { name: 'Fertilizers', slug: 'fertilizers', icon: '🌾' },
    { name: 'Crop Protection', slug: 'crop-protection', icon: '🛡️' },
    { name: 'Livestock Supplies', slug: 'livestock-supplies', icon: '🐄' },
    { name: 'Irrigation & Watering', slug: 'irrigation-watering', icon: '💧' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO title={seoTitle} description={seoDescription} canonical={canonical} />
      <JsonLd schema={organizationSchema()} id="org-schema" />
      <JsonLd schema={websiteSchema()} id="website-schema" />
      <JsonLd schema={siteNavigationElementSchema()} id="sitenav-schema" />

      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Main navigation">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" aria-label="AgriBuyX Home">
            <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/products" className="hover:text-emerald-700">Marketplace</Link>
            <Link href="/categories/farm-machinery-equipment" className="hover:text-emerald-700">Machinery</Link>
            <Link href="/categories/seeds" className="hover:text-emerald-700">Seeds</Link>
            <Link href="/categories/fertilizers" className="hover:text-emerald-700">Fertilizers</Link>
            <Link href="/blog" className="hover:text-emerald-700">Blog</Link>
            <Link href="/admin/login" className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Vendor Office</Link>
          </div>
          {/* Mobile menu trigger could go here */}
          <div className="flex md:hidden items-center gap-4 text-sm font-medium">
             <Link href="/products" className="hover:text-emerald-700">Marketplace</Link>
             <Link href="/admin/login" className="text-emerald-700">Vendors</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl max-w-3xl">
            Agricultural Marketplace in <span className="text-emerald-600">Ghana</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl">
            AgriBuyX connects farmers with trusted vendors. Find quality seeds, fertilizers, crop protection, livestock supplies, farm machinery, and equipment all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link href="/products" className="rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 w-full sm:w-auto">
              Browse Marketplace
            </Link>
            <Link href="/admin/login" className="rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50 w-full sm:w-auto">
              Vendor Office
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20 w-full">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Shop by Category</h2>
          <p className="mt-2 text-sm text-slate-600">Find exactly what your farm needs from verified sellers.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categoryLinks.map((cat) => (
            <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md hover:-translate-y-1">
              <span className="text-4xl" aria-hidden="true">{cat.icon}</span>
              <h3 className="text-center text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Why AgriBuyX Section */}
      <section className="bg-emerald-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 text-white">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-800">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-bold">Trusted Sellers</h3>
              <p className="mt-2 text-emerald-100 text-sm">We verify agricultural vendors across Ghana to ensure quality inputs.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-800">
                <span className="text-2xl">🚜</span>
              </div>
              <h3 className="text-lg font-bold">Wide Selection</h3>
              <p className="mt-2 text-emerald-100 text-sm">From heavy farm machinery to specialized crop protection, find it all here.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-800">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-bold">Direct Contact</h3>
              <p className="mt-2 text-emerald-100 text-sm">Connect directly with sellers via phone or WhatsApp to negotiate and buy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20 w-full flex-grow">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Products</h2>
              <p className="mt-1 text-sm text-slate-600">Latest agricultural products added to the marketplace.</p>
            </div>
            <Link href="/products" className="hidden text-sm font-semibold text-emerald-600 hover:text-emerald-700 sm:block">
              View all products &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={productUrl(product)} className="group block h-full">
                <article className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-slate-50">
                    {product.image_url ? (
                      <img
                        src={getThumbnailUrl(product.image_url, 400, 300)}
                        alt={`${product.title} for sale in Ghana`}
                        className="h-full w-full object-contain p-1 transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No image</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-900">
                      {product.title}
                    </h3>
                    <p className="mt-1.5 text-base font-bold text-emerald-700">{formatPriceGHS(product.price)}</p>
                    {product.location && (
                      <p className="mt-1 truncate text-xs text-slate-500">📍 {product.location}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="inline-block rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              View all products
            </Link>
          </div>
        </section>
      )}

      {/* Trust Notes / Footer Prep */}
      <div className="mt-auto bg-slate-100 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-slate-500">
            <strong>Buyer Note:</strong> Always verify sellers and products before making payments. AgriBuyX connects you directly with vendors.
          </p>
        </div>
      </div>

      <MarketplaceFooter />
    </div>
  )
}
