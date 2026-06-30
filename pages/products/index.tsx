/**
 * pages/products/index.tsx — Marketplace Listing Page
 *
 * Changes from original:
 *  - Added <SEO> head with marketplace title, description, canonical, OG
 *  - Added <JsonLd> with WebSite + Organization schema
 *  - Fixed product card images: object-contain with neutral bg (was object-cover = center-crop)
 *  - Improved mobile card layout: bigger touch targets, cleaner spacing
 *  - Added proper aria labels and semantic HTML (article, nav, main, section)
 *  - Added skip-to-content link for accessibility
 *  - All existing filter/search/category/load-more logic preserved exactly
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getThumbnailUrl } from '@/lib/cloudinary'
import MarketplaceFooter from '@/components/MarketplaceFooter'
import SEO from '@/components/SEO'
import JsonLd from '@/components/JsonLd'
import { marketplaceSeoTitle, marketplaceSeoDescription, canonicalUrl, formatPriceGHS } from '@/lib/seo'
import { websiteSchema, organizationSchema } from '@/lib/schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  title: string
  description?: string | null
  price?: number | string | null
  location?: string | null
  category_id?: string | null
  created_at: string
  image_url?: string | null
  condition?: string
  warranty?: string
  warranty_period?: string
  features?: string
  contact_phone?: string
  slug?: string | null
}

interface Category {
  id: string
  name: string
  icon: string
  description?: string
  parent_id?: string | null
}

interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string | null
  image_url?: string | null
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCardImageUrl(url: string) {
  if (!url) return url
  return getThumbnailUrl(url, 400, 300)
}

function asText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

// ─── SSR Props ────────────────────────────────────────────────────────────────

interface PageProps {
  initialProducts: Product[]
  initialCategories: Category[]
  initialBlogPosts: BlogPost[]
  initialSocialLinks: Record<string, string>
}

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const server = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [productsRes, categoriesRes, blogRes, socialRes] = await Promise.all([
    server.from('products').select('*').order('created_at', { ascending: false }).limit(60),
    server.from('categories').select('*').order('name', { ascending: true }),
    server.from('blog_posts').select('id,title,slug,summary,image_url,created_at').order('created_at', { ascending: false }).limit(5),
    server.from('site_settings').select('key,value'),
  ])

  const socialMap: Record<string, string> = {}
  if (socialRes.data) {
    socialRes.data.forEach((row: any) => { if (row.key) socialMap[row.key] = row.value || '' })
  }

  return {
    props: {
      initialProducts: (productsRes.data || []) as Product[],
      initialCategories: (categoriesRes.data || []) as Category[],
      initialBlogPosts: (blogRes.data || []) as BlogPost[],
      initialSocialLinks: socialMap,
    },
  }
}

// ─── ItemList JSON-LD ─────────────────────────────────────────────────────────

function itemListSchema(products: Product[]) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://agribuyx.com'
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Agricultural Products in Ghana — AgriBuyX Marketplace',
    url: `${base}/products`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 50).map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: p.slug ? `${base}/products/${p.slug}` : `${base}/products/${p.id}`,
      name: p.title,
    })),
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Products({ initialProducts, initialCategories, initialBlogPosts, initialSocialLinks }: PageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [locations, setLocations] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [loading, setLoading] = useState(false)  // false: SSR data already present
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts)
  const [blogLoading, setBlogLoading] = useState(false)
  const [socialLinks, setSocialLinks] = useState<{ [key: string]: string }>(initialSocialLinks)
  const [socialLoading, setSocialLoading] = useState(false)
  const [categorySearch, setCategorySearch] = useState<string>('')
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false)
  const [activeMainCategoryId, setActiveMainCategoryId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState<number>(12)
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportError, setSupportError] = useState<string | null>(null)
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null)
  const [supportForm, setSupportForm] = useState({ name: '', email: '', category: '', message: '' })
  const filtersRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { fetchProducts() }, [selectedCategory, categories])
  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchBlogPosts(); fetchSocialLinks() }, [])
  // Note: initial data comes from SSR props above; useEffect re-fetches for interactivity (filters, etc.)

  useEffect(() => {
    if (!activeMainCategoryId) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!filtersRef.current) return
      if (!filtersRef.current.contains(event.target as Node)) {
        setActiveMainCategoryId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => { document.removeEventListener('mousedown', handleClickOutside) }
  }, [activeMainCategoryId])

  useEffect(() => { setVisibleCount(12) }, [selectedCategory, searchQuery, selectedLocation])

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (selectedCategory) {
      const childCategoryIds = categories.filter((cat) => cat.parent_id === selectedCategory).map((cat) => cat.id)
      query = query.in('category_id', [selectedCategory, ...childCategoryIds])
    }
    const { data, error } = await query
    if (!error) {
      const items = (data || []) as Product[]
      setProducts(items)
      setLocations(Array.from(new Set(items.map((p) => p.location).filter((l): l is string => Boolean(l)))))
    } else {
      setProducts([])
      setLocations([])
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(5)
    if (!error && data) setBlogPosts(data as BlogPost[])
    setBlogLoading(false)
  }

  const fetchSocialLinks = async () => {
    const { data, error } = await supabase.from('site_settings').select('*')
    if (!error && data) {
      const map: { [key: string]: string } = {}
      data.forEach((row: any) => { if (row.key) map[row.key] = row.value || '' })
      setSocialLinks(map)
    }
    setSocialLoading(false)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      asText(product.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      asText(product.description).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation = selectedLocation ? product.location === selectedLocation : true
    return matchesSearch && matchesLocation
  })

  const mainCategories = categories.filter((cat) => !cat.parent_id)
  const filteredMainCategories = mainCategories.filter((cat) =>
    asText(cat.name).toLowerCase().includes(categorySearch.toLowerCase())
  )
  const visibleMainCategories = showAllCategories ? filteredMainCategories : filteredMainCategories.slice(0, 10)
  const selectedCategoryName = categories.find((cat) => cat.id === selectedCategory)?.name || 'All products'
  const activeFilterCount = [selectedCategory, selectedLocation, searchQuery.trim()].filter(Boolean).length

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedLocation('')
    setSearchQuery('')
    setCategorySearch('')
    setActiveMainCategoryId(null)
  }

  const getSubcategories = (parentId: string) => categories.filter((cat) => cat.parent_id === parentId)

  const handleMainCategoryClick = (cat: Category) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSelectedCategory(cat.id)
      setActiveMainCategoryId(null)
      return
    }
    const hasChildren = getSubcategories(cat.id).length > 0
    if (hasChildren) {
      setActiveMainCategoryId(cat.id)
    } else {
      setSelectedCategory(cat.id)
      setActiveMainCategoryId(null)
    }
  }

  const tickerItems: string[] = []
  blogPosts.forEach((post) => { tickerItems.push(`Blog: ${post.title}`) })
  if (socialLinks['whatsapp_channel_url']) {
    tickerItems.push('Join our WhatsApp channel for price alerts and updates')
  }

  const hasSocialLinks =
    Boolean(socialLinks['whatsapp_channel_url']) ||
    Boolean(socialLinks['tiktok_url']) ||
    Boolean(socialLinks['facebook_url'])

  // ── JSON-LD schema ──────────────────────────────────────────────────────
  const allDisplayedProducts = filteredProducts.slice(0, visibleCount)

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportForm.email || !supportForm.message) {
      setSupportError('Email and message are required')
      return
    }
    setSupportSubmitting(true)
    setSupportError(null)
    setSupportSuccess(null)
    try {
      const res = await fetch('/api/support-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportForm),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setSupportError(data?.error || 'Failed to send message')
      } else {
        setSupportSuccess('Message sent. We will get back to you on email.')
        setSupportForm({ name: '', email: '', category: '', message: '' })
      }
    } catch {
      setSupportError('Network error. Please try again later.')
    } finally {
      setSupportSubmitting(false)
    }
  }

  const productUrl = (p: Product) => p.slug ? `/products/${p.slug}` : `/products/${p.id}`

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title={marketplaceSeoTitle}
        description={marketplaceSeoDescription}
        canonical={canonicalUrl('/products')}
      />
      <JsonLd schema={websiteSchema()} id="website-schema" />
      <JsonLd schema={organizationSchema()} id="org-schema" />
      <JsonLd schema={itemListSchema(products)} id="itemlist-schema" />

      {/* Skip to content */}
      <a href="#marketplace-main" className="skip-to-content">Skip to marketplace</a>

      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/products" className="flex items-center gap-2" aria-label="AgriBuyX home">
              <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 md:hidden">
              <Link href="/blog" className="hover:text-emerald-700">Blog</Link>
              {socialLinks['whatsapp_channel_url'] && (
                <a href={socialLinks['whatsapp_channel_url']} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700">
                  Channel
                </a>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-4">
            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative flex-1 md:w-80 lg:w-96">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <label htmlFor="marketplace-search" className="sr-only">Search products</label>
                <input
                  id="marketplace-search"
                  type="search"
                  placeholder="Search seeds, fertilizer, tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSupportOpen(true)}
                className="hidden h-10 items-center rounded-lg border border-emerald-600 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 md:inline-flex"
              >
                Support
              </button>
            </div>
            <div className="hidden items-center justify-end gap-3 text-sm md:flex">
              <Link href="/blog" className="inline-flex items-center rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100">
                Blog
              </Link>
              {socialLinks['whatsapp_channel_url'] && (
                <a
                  href={socialLinks['whatsapp_channel_url']}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Channel
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* News Ticker */}
      {tickerItems.length > 0 && (
        <div className="bg-slate-900 text-[11px] text-white sm:text-xs" aria-hidden="true">
          <div className="max-w-7xl mx-auto px-4 py-2 overflow-hidden">
            <div className="ticker-marquee">
              {tickerItems.concat(tickerItems).map((item, index) => (
                <span key={index} className="opacity-90">{item}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <header className="border-b border-slate-200 bg-white px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">AgriBuyX Marketplace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
              Farm inputs and agricultural products
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Find seeds, fertilizers, crop protection, livestock supplies, and farm equipment from trusted vendors in Ghana.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 md:min-w-72">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-lg font-bold text-slate-950">{products.length}</p>
              <p>Products</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-lg font-bold text-slate-950">{mainCategories.length}</p>
              <p>Categories</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-lg font-bold text-slate-950">{locations.length}</p>
              <p>Locations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="marketplace-main" className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        {/* Mobile category chips — horizontal scroll */}
        <div
          className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          role="group"
          aria-label="Filter by category"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            aria-pressed={selectedCategory === ''}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === ''
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            All
          </button>
          {mainCategories.slice(0, 7).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleMainCategoryClick(cat)}
              aria-pressed={selectedCategory === cat.id}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span className="mr-1" aria-hidden="true">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Sidebar Filters */}
          <aside ref={filtersRef} className="lg:col-span-3 relative" aria-label="Filters">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Filters</h2>
                  <p className="text-xs text-slate-500">{activeFilterCount} active</p>
                </div>
                {activeFilterCount > 0 && (
                  <button type="button" onClick={clearFilters} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category search */}
              <div className="mb-3">
                <label htmlFor="category-search" className="sr-only">Search categories</label>
                <input
                  id="category-search"
                  type="text"
                  value={categorySearch}
                  onChange={(e) => { setCategorySearch(e.target.value); setShowAllCategories(false) }}
                  placeholder="Search categories..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Category list */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-1" role="group" aria-label="Category list">
                <button
                  onClick={() => setSelectedCategory('')}
                  aria-pressed={selectedCategory === ''}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    selectedCategory === '' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  All Products
                </button>
                {visibleMainCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleMainCategoryClick(cat)}
                    aria-pressed={selectedCategory === cat.id}
                    className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] transition sm:text-xs md:text-sm lg:flex-row lg:items-center lg:justify-between lg:px-3 ${
                      selectedCategory === cat.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 lg:flex-row lg:items-center lg:gap-2">
                      <span className="text-lg lg:text-base" aria-hidden="true">{cat.icon}</span>
                      <span className="text-center lg:text-left truncate max-w-[4.5rem] sm:max-w-[6rem] md:max-w-none">{cat.name}</span>
                    </div>
                    {getSubcategories(cat.id).length > 0 && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="hidden h-3 w-3 text-slate-500 lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                ))}
                {filteredMainCategories.length > 10 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full px-3 py-1.5 text-left text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    {showAllCategories ? 'Show fewer' : `Show all ${filteredMainCategories.length} categories`}
                  </button>
                )}
              </div>

              {/* Location filter */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <label htmlFor="location-filter" className="text-xs font-semibold uppercase text-slate-500">Location</label>
                <select
                  id="location-filter"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">All locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {selectedLocation && (
                  <button type="button" onClick={() => setSelectedLocation('')} className="text-xs font-medium text-slate-500 underline">
                    Clear location
                  </button>
                )}
              </div>
            </div>

            {/* Subcategory flyout */}
            {activeMainCategoryId && (
              <div className="absolute left-full top-0 z-30 ml-4 hidden w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:block">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  {categories.find((cat) => cat.id === activeMainCategoryId)?.name}
                </h3>
                <div className="space-y-2">
                  {getSubcategories(activeMainCategoryId).map((subcat) => (
                    <button
                      key={subcat.id}
                      onClick={() => { setSelectedCategory(subcat.id); setActiveMainCategoryId(null) }}
                      className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                        selectedCategory === subcat.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <span className="mr-1" aria-hidden="true">{subcat.icon}</span>
                      {subcat.name}
                    </button>
                  ))}
                  {getSubcategories(activeMainCategoryId).length === 0 && (
                    <p className="text-xs text-slate-500">No subcategories yet.</p>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Products Grid */}
          <section className="lg:col-span-6" aria-label="Product listings">
            {/* Results bar */}
            <div className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">{selectedCategoryName}</p>
                <p className="text-xs text-slate-500">
                  {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}
                  {selectedLocation ? ` in ${selectedLocation}` : ''}
                </p>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"
                >
                  Reset view
                </button>
              )}
            </div>

            {/* Loading skeletons */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4" aria-label="Loading products">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>

            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <p className="text-lg font-semibold text-slate-900">No products found</p>
                <p className="mt-1 text-sm text-slate-600">Try a different search, category, or location.</p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>

            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                  {filteredProducts.slice(0, visibleCount).map((product) => (
                    <Link key={product.id} href={productUrl(product)} className="group block">
                      <article className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">

                        {/* Product image — object-contain to avoid center-crop on portrait images */}
                        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-slate-50">
                          {product.image_url ? (
                            <img
                              src={getCardImageUrl(product.image_url)}
                              alt={`${product.title} for sale in Ghana on AgriBuyX`}
                              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02] p-1"
                              loading="lazy"
                              width={400}
                              height={300}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-xs font-medium text-slate-400">No image</span>
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-900">
                            {product.title || 'Untitled product'}
                          </h3>
                          <p className="mb-1.5 text-base font-bold text-emerald-700">
                            {formatPriceGHS(product.price)}
                          </p>
                          {product.description && (
                            <p className="mb-2 line-clamp-2 text-xs leading-5 text-slate-500">
                              {product.description}
                            </p>
                          )}
                          {product.location && (
                            <p className="truncate border-t border-slate-100 pt-2 text-xs font-medium text-slate-500">
                              📍 {product.location}
                            </p>
                          )}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {visibleCount < filteredProducts.length && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-emerald-300 transition"
                    >
                      Load more products ({filteredProducts.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Right sidebar — updates, social, marketplace notes */}
          <aside className="lg:col-span-3" aria-label="Marketplace sidebar">
            <div className="space-y-4 lg:sticky lg:top-24">

              {/* Support CTA */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Buyer help</p>
                <h2 className="mt-1 text-base font-bold text-slate-950">Need help choosing?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Ask about product availability, pricing, seller contact, or complaints.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(true)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Contact support
                </button>
              </div>

              {/* Blog previews */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Updates &amp; Tips</h2>
                    <p className="mt-1 text-sm text-slate-600">Market news and practical buying notes.</p>
                  </div>
                  <Link href="/blog" className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    View all
                  </Link>
                </div>
                {blogLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-lg border border-slate-100 p-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                        <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : blogPosts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    No updates yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blogPosts.slice(0, 3).map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded-lg border border-slate-200 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50">
                        <p className="text-xs font-medium text-slate-500">
                          {new Date(post.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{post.title}</p>
                        {post.summary && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{post.summary}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Social links */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Follow AgriBuyX</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">Get new product alerts and marketplace updates.</p>
                <div className="mt-4 grid gap-2">
                  {socialLinks['whatsapp_channel_url'] && (
                    <a href={socialLinks['whatsapp_channel_url']} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-between rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                      <span>WhatsApp updates</span><span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {socialLinks['tiktok_url'] && (
                    <a href={socialLinks['tiktok_url']} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white hover:bg-black">
                      <span>TikTok</span><span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {socialLinks['facebook_url'] && (
                    <a href={socialLinks['facebook_url']} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-between rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                      <span>Facebook</span><span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
                {!socialLoading && !hasSocialLinks && (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Social links are not configured yet.
                  </p>
                )}
              </div>

              {/* Marketplace notes */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Marketplace notes</h2>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                    <p>Contact the seller directly before visiting or making payment.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                    <p>Confirm price, quantity, location, and product condition.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                    <p>Report suspicious listings through support.</p>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </main>

      {/* Mobile floating support button */}
      <button
        type="button"
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg md:hidden hover:bg-emerald-700 transition"
        aria-label="Open support and complaints"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 19l1.5-3A7 7 0 0112 5h0a7 7 0 017 7v0a7 7 0 01-7 7H5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h.01M12 11h.01M15 11h.01" />
        </svg>
      </button>

      {/* Support Modal */}
      {isSupportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="support-modal-title" className="text-base font-semibold text-slate-900">Support / Complaints</h2>
              <button
                type="button"
                onClick={() => { setIsSupportOpen(false); setSupportError(null); setSupportSuccess(null) }}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close support modal"
              >
                ✕
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-600">Tell us what you need help with. We will reply from support@agribuyx.com.</p>
            <form onSubmit={handleSupportSubmit} className="space-y-3 text-sm" noValidate>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="support-name" className="mb-1 block text-xs font-medium text-slate-700">Name</label>
                  <input
                    id="support-name"
                    type="text"
                    value={supportForm.name}
                    onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="support-email" className="mb-1 block text-xs font-medium text-slate-700">Email *</label>
                  <input
                    id="support-email"
                    type="email"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                    required
                    aria-required="true"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="support-topic" className="mb-1 block text-xs font-medium text-slate-700">Topic</label>
                <select
                  id="support-topic"
                  value={supportForm.category}
                  onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select</option>
                  <option value="Product issue">Product issue</option>
                  <option value="Payment or pricing">Payment or pricing</option>
                  <option value="Account or login">Account or login</option>
                  <option value="Suggestion or feedback">Suggestion or feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="support-message" className="mb-1 block text-xs font-medium text-slate-700">Message *</label>
                <textarea
                  id="support-message"
                  rows={4}
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  required
                  aria-required="true"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {supportError && <p role="alert" className="text-xs text-red-600">{supportError}</p>}
              {supportSuccess && <p role="status" className="text-xs text-emerald-600">{supportSuccess}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsSupportOpen(false); setSupportError(null); setSupportSuccess(null) }}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={supportSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                >
                  {supportSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MarketplaceFooter
        socialLinks={{
          whatsapp_channel_url: socialLinks['whatsapp_channel_url'],
          tiktok_url: socialLinks['tiktok_url'],
          facebook_url: socialLinks['facebook_url'],
        }}
        onSupportClick={() => setIsSupportOpen(true)}
      />
    </div>
  )
}
