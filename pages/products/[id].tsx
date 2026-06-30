/**
 * Product Detail Page — pages/products/[id].tsx
 *
 * SEO: getServerSideProps fetches product data server-side so Google can index content.
 * The page also supports /products/[slug] via redirect (see pages/products/[slug].tsx).
 *
 * Changes from original:
 *  - Added getServerSideProps for SSR (critical for Google indexing)
 *  - Added <SEO> with generated title, description, canonical, OG image
 *  - Added <JsonLd> with Product + Breadcrumb schema
 *  - Fixed image containers: object-contain with neutral bg (was object-cover / center-crop)
 *  - Improved alt text (SEO-optimised)
 *  - Added trust messaging ("Listed on AgriBuyX", availability note)
 *  - Added breadcrumb nav with proper links (was decorative text)
 *  - All existing functionality preserved (wishlist, share, related products, vendor contact)
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getWatermarkedImageUrl as getCloudinaryUrl } from '@/lib/cloudinary'
import MarketplaceFooter from '@/components/MarketplaceFooter'
import SEO from '@/components/SEO'
import JsonLd from '@/components/JsonLd'
import { productSeoTitle, productSeoDescription, productImageAlt, canonicalUrl, formatPriceGHS } from '@/lib/seo'
import { productSchema, breadcrumbSchema } from '@/lib/schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  title: string
  description?: string | null
  price?: number | string | null
  location?: string | null
  image_url?: string | null
  category_id?: string | null
  created_at: string
  condition?: string
  warranty?: string
  warranty_period?: string
  features?: string
  contact_phone?: string
  created_by?: string
  slug?: string | null
}

interface Vendor {
  id: string
  business_name: string
  whatsapp_url?: string
  facebook_url?: string
  tiktok_url?: string
  instagram_url?: string
}

interface Category {
  id: string
  name: string
  icon: string
  slug?: string | null
}

interface ProductImage {
  id: string
  product_id: string
  image_url: string
}

interface Props {
  product: Product | null
  category: Category | null
  vendor: Vendor | null
  images: ProductImage[]
  relatedProducts: Product[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWatermarkedImageUrl(url: string) {
  if (!url) return url
  return getCloudinaryUrl(url)
}

// ─── SSR Data Fetching ────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.params || {}

  if (!id || typeof id !== 'string') {
    return { notFound: true }
  }

  // Use anon Supabase client (same as client-side, RLS applies)
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch product — try by slug first, then by UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  let productData: Product | null = null

  if (isUuid) {
    const { data } = await supabaseServer.from('products').select('*').eq('id', id).single()
    productData = data
  } else {
    // Try slug lookup
    const { data } = await supabaseServer.from('products').select('*').eq('slug', id).single()
    productData = data
    // If found by slug but the URL has /products/[slug], that's the canonical route
  }

  if (!productData) {
    return { notFound: true }
  }

  // Fetch category
  let categoryData: Category | null = null
  if (productData.category_id) {
    const { data } = await supabaseServer
      .from('categories')
      .select('id, name, icon, slug')
      .eq('id', productData.category_id)
      .single()
    categoryData = data
  }

  // Fetch product images
  let imagesData: ProductImage[] = []
  const { data: imgs, error: imgErr } = await supabaseServer
    .from('product_images')
    .select('*')
    .eq('product_id', productData.id)

  if (!imgErr || imgErr.code !== '42P01') {
    imagesData = imgs || []
  }

  // Fetch vendor
  let vendorData: Vendor | null = null
  if (productData.created_by) {
    const { data } = await supabaseServer
      .from('vendors')
      .select('id, business_name, whatsapp_url, facebook_url, tiktok_url, instagram_url')
      .eq('id', productData.created_by)
      .single()
    vendorData = data
  }

  // Fetch related products (same category, different id)
  let relatedData: Product[] = []
  if (productData.category_id) {
    const { data } = await supabaseServer
      .from('products')
      .select('*')
      .eq('category_id', productData.category_id)
      .neq('id', productData.id)
      .order('created_at', { ascending: false })
      .limit(8)
    relatedData = data || []
  }

  return {
    props: {
      product: productData,
      category: categoryData,
      vendor: vendorData,
      images: imagesData,
      relatedProducts: relatedData,
    },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductDetail({ product, category, vendor, images, relatedProducts }: Props) {
  const router = useRouter()
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
  const [relatedVisibleCount, setRelatedVisibleCount] = useState<number>(4)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Gallery images — prefer product_images table, fall back to image_url
  const galleryImages =
    images.length > 0
      ? images
      : product?.image_url
        ? [{ id: product.id, product_id: product.id, image_url: product.image_url }]
        : []

  // Initialise selected image
  useEffect(() => {
    if (galleryImages.length > 0 && !selectedImageUrl) {
      setSelectedImageUrl(galleryImages[0].image_url)
    }
  }, [galleryImages])

  // Wishlist
  useEffect(() => {
    if (!product) return
    try {
      const stored = JSON.parse(localStorage.getItem('agribuyx_wishlist') || '[]')
      setIsInWishlist(stored.includes(product.id))
    } catch {
      setIsInWishlist(false)
    }
  }, [product])

  useEffect(() => {
    setRelatedVisibleCount(4)
  }, [product?.id])

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Link href="/products" className="inline-flex items-center gap-2">
              <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
            </Link>
          </div>
        </nav>
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="text-center">
            <p className="mb-2 text-lg font-semibold text-slate-900">Product not found</p>
            <p className="mb-4 text-sm text-slate-600">This listing may have been removed.</p>
            <Link href="/products" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── SEO values ────────────────────────────────────────────────────────────

  const seoInput = {
    title: product.title,
    category: category?.name,
    location: product.location,
    description: product.description,
    price: product.price,
    condition: product.condition,
  }

  const seoTitle = productSeoTitle(seoInput)
  const seoDescription = productSeoDescription(seoInput)

  // Canonical: prefer slug route, fall back to id route
  const canonicalPath = product.slug
    ? `/products/${product.slug}`
    : `/products/${product.id}`
  const canonical = canonicalUrl(canonicalPath)

  // OG image — use first product image if available
  const ogImage = galleryImages[0]?.image_url || product.image_url || null

  // ── Schema ────────────────────────────────────────────────────────────────

  const productSchemaData = productSchema({
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    image_url: product.image_url,
    images: galleryImages.map((img) => img.image_url),
    category: category?.name,
    condition: product.condition,
    location: product.location,
    slug: product.slug,
    created_at: product.created_at,
    vendor_name: vendor?.business_name,
  })

  const breadcrumbItems = [
    { name: 'Home', url: canonicalUrl('/') },
    { name: 'Marketplace', url: canonicalUrl('/products') },
    ...(category ? [{ name: category.name, url: canonicalUrl('/products') }] : []),
    { name: product.title, url: canonical },
  ]

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('agribuyx_wishlist') || '[]')
      const next = stored.includes(product.id)
        ? stored.filter((pid: string) => pid !== product.id)
        : [...stored, product.id]
      localStorage.setItem('agribuyx_wishlist', JSON.stringify(next))
      setIsInWishlist(next.includes(product.id))
    } catch {
      // ignore wishlist errors
    }
  }

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'telegram') => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const text = `Check out ${product.title} on AgriBuyX`
    const encoded = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}&text=${encodedText}`,
    }

    window.open(urls[platform], '_blank', 'noopener,noreferrer')
  }

  const copyLink = async () => {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // ignore clipboard errors
    }
  }

  const whatsappContactUrl = (() => {
    if (vendor?.whatsapp_url) return vendor.whatsapp_url
    const raw = product.contact_phone || ''
    const digits = raw.replace(/[^0-9]/g, '')
    const message = encodeURIComponent(`Hello, I'm interested in ${product.title}`)
    return digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`
  })()

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        ogImage={ogImage}
        ogType="website"
      />
      <JsonLd schema={productSchemaData} id="product-schema" />
      <JsonLd schema={breadcrumbSchema(breadcrumbItems)} id="breadcrumb-schema" />

      {/* Skip to content */}
      <a href="#product-main" className="skip-to-content">Skip to main content</a>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Main navigation">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-4 py-3 gap-y-3">
          <Link href="/" aria-label="AgriBuyX — back to marketplace">
            <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3 md:gap-5 text-sm font-medium text-slate-700 overflow-x-auto">
            <Link href="/products" className="hover:text-emerald-700 whitespace-nowrap">Marketplace</Link>
            <Link href="/categories/farm-machinery-equipment" className="hover:text-emerald-700 whitespace-nowrap hidden sm:inline-block">Machinery</Link>
            <Link href="/categories/seeds" className="hover:text-emerald-700 whitespace-nowrap hidden sm:inline-block">Seeds</Link>
            <Link href="/categories/fertilizers" className="hover:text-emerald-700 whitespace-nowrap hidden md:inline-block">Fertilizers</Link>
            <Link href="/blog" className="hover:text-emerald-700 whitespace-nowrap">Blog</Link>
            <Link href="/admin/login" className="hover:text-emerald-700 whitespace-nowrap">Vendor</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="product-main" className="mx-auto max-w-7xl px-4 py-6 md:py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            <li><Link href="/products" className="hover:text-emerald-700">Home</Link></li>
            <li aria-hidden="true"><span className="mx-1">/</span></li>
            <li><Link href="/products" className="hover:text-emerald-700">Products</Link></li>
            {category && (
              <>
                <li aria-hidden="true"><span className="mx-1">/</span></li>
                <li>
                  <span className="truncate max-w-[8rem] sm:max-w-xs">{category.icon} {category.name}</span>
                </li>
              </>
            )}
            <li aria-hidden="true"><span className="mx-1">/</span></li>
            <li aria-current="page">
              <span className="max-w-[10rem] truncate font-medium text-slate-700 sm:max-w-xs">{product.title}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-8 lg:grid-cols-12">

          {/* LEFT: Image gallery */}
          <div className="md:col-span-4 lg:col-span-5">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {galleryImages.length > 0 ? (
                <>
                  {/* Main image — object-contain so full product is visible */}
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-slate-50 p-2">
                    <img
                      src={getWatermarkedImageUrl(selectedImageUrl || galleryImages[0].image_url)}
                      alt={productImageAlt(seoInput)}
                      className="h-full w-full object-contain"
                      loading="eager"
                    />
                  </div>

                  {/* Thumbnails */}
                  {galleryImages.length > 1 && (
                    <div className="border-t border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="grid grid-cols-4 gap-2">
                        {galleryImages.map((img, idx) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setSelectedImageUrl(img.image_url)}
                            className={`overflow-hidden rounded-lg border-2 transition ${
                              selectedImageUrl === img.image_url
                                ? 'border-emerald-600'
                                : 'border-transparent hover:border-slate-300'
                            }`}
                            aria-label={productImageAlt(seoInput, idx)}
                            aria-pressed={selectedImageUrl === img.image_url}
                          >
                            <div className="flex aspect-square w-full items-center justify-center bg-slate-100 p-1">
                              <img
                                src={getWatermarkedImageUrl(img.image_url)}
                                alt={productImageAlt(seoInput, idx)}
                                className="h-full w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-100">
                  <span className="text-sm font-medium text-slate-500">No image available</span>
                </div>
              )}
            </div>

            {/* Trust signal — below image on mobile */}
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Listed on AgriBuyX
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>Contact seller to confirm availability</span>
            </div>
          </div>

          {/* CENTER: Product info */}
          <div className="md:col-span-4 lg:col-span-4 space-y-4">
            {category && (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span aria-hidden="true">{category.icon}</span>
                <span>{category.name}</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold leading-snug text-slate-950 md:text-3xl">{product.title}</h1>
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label={isInWishlist ? `Remove ${product.title} from saved` : `Save ${product.title}`}
                aria-pressed={isInWishlist}
                className={`inline-flex shrink-0 items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  isInWishlist
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="mr-1" aria-hidden="true">{isInWishlist ? '❤' : '♡'}</span>
                <span>{isInWishlist ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {product.location && (
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-1">
                  📍 {product.location}
                </span>
              )}
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-1">
                Listed {new Date(product.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-4">
              {product.description && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="mb-2 text-sm font-semibold text-slate-900">Description</h2>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {product.description}
                  </p>
                </div>
              )}

              {product.features && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="mb-2 text-sm font-semibold text-slate-900">Features &amp; Specifications</h2>
                  <ul className="rounded-lg bg-slate-50 p-3 space-y-1">
                    {product.features.split('\n').map((feature: string, idx: number) =>
                      feature.trim() ? (
                        <li key={idx} className="break-words text-sm text-slate-700">
                          {feature.trim().startsWith('-') ? feature.trim() : `• ${feature.trim()}`}
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs">
              <span className="font-semibold text-slate-600">Share:</span>
              <button
                type="button"
                onClick={() => handleShare('whatsapp')}
                className="font-semibold text-emerald-700 hover:text-emerald-800"
                aria-label="Share on WhatsApp"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => handleShare('facebook')}
                className="font-semibold text-blue-700 hover:text-blue-800"
                aria-label="Share on Facebook"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => handleShare('telegram')}
                className="font-semibold text-blue-500 hover:text-blue-600"
                aria-label="Share on Telegram"
              >
                Telegram
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="font-semibold text-slate-600 hover:text-slate-800"
                aria-label="Copy link to clipboard"
              >
                {copySuccess ? '✓ Copied' : 'Copy link'}
              </button>
            </div>
          </div>

          {/* RIGHT: Price + Contact box */}
          <div className="md:col-span-8 lg:col-span-3">
            <aside
              aria-label="Price and contact"
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24"
            >
              {/* Price */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
                <p className="text-2xl font-bold text-emerald-700 md:text-3xl">
                  {formatPriceGHS(product.price)}
                </p>
              </div>

              {/* Quick specs */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">Condition</p>
                  <p className="font-semibold">{product.condition || 'New'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">Warranty</p>
                  <p className="font-semibold">
                    {product.warranty === 'Yes' ? product.warranty_period || 'Yes' : 'No'}
                  </p>
                </div>
                {product.location && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] uppercase text-slate-500">Location</p>
                    <p className="font-semibold">{product.location}</p>
                  </div>
                )}
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">Posted</p>
                  <p className="font-semibold">
                    {new Date(product.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Contact seller */}
              <div className="border-t border-slate-100 pt-3">
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Contact seller</h2>
                  {vendor && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      Sold by: <span className="font-medium text-emerald-700">{vendor.business_name}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={whatsappContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    aria-label={`WhatsApp seller about ${product.title}`}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    WhatsApp seller
                  </a>

                  {vendor?.facebook_url && (
                    <a
                      href={vendor.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-blue-800 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900"
                      aria-label={`Contact seller on Facebook about ${product.title}`}
                    >
                      Facebook
                    </a>
                  )}

                  {vendor?.tiktok_url && (
                    <a
                      href={vendor.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                      aria-label={`View seller on TikTok`}
                    >
                      TikTok
                    </a>
                  )}

                  {vendor?.instagram_url && (
                    <a
                      href={vendor.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 py-2.5 text-sm font-semibold text-white transition opacity-90 hover:opacity-100"
                      aria-label={`View seller on Instagram`}
                    >
                      Instagram
                    </a>
                  )}

                  <a
                    href={`mailto:support@agribuyx.com?subject=Enquiry: ${encodeURIComponent(product.title)}`}
                    className="flex items-center justify-center rounded-lg bg-slate-700 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    aria-label="Email AgriBuyX support"
                  >
                    Email support
                  </a>
                </div>
              </div>

              {/* Trust note */}
              <p className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] leading-5 text-slate-600">
                Confirm price, condition, and location with the seller before payment or pickup.
                Report suspicious listings to support.
              </p>
            </aside>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              Similar products
            </h2>
            <div className="grid grid-cols-2 gap-3 min-[430px]:grid-cols-2 md:grid-cols-4 md:gap-4">
              {relatedProducts.slice(0, relatedVisibleCount).map((item) => (
                <Link key={item.id} href={item.slug ? `/products/${item.slug}` : `/products/${item.id}`} className="group block">
                  <article className="h-full cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-50 p-1">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={`${item.title} for sale in Ghana on AgriBuyX`}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">No image</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="mb-1 truncate text-xs text-slate-500">{category?.name || 'Product'}</p>
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm font-bold text-emerald-700">{formatPriceGHS(item.price)}</p>
                      {item.location && (
                        <p className="mt-1 truncate text-xs text-slate-500">📍 {item.location}</p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            {relatedVisibleCount < relatedProducts.length && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setRelatedVisibleCount((prev) => prev + 4)}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Load more similar products
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <MarketplaceFooter />
    </div>
  )
}
