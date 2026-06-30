/**
 * Category Landing Page — pages/categories/[slug].tsx
 *
 * SEO-friendly category pages at /categories/[slug].
 * Shows category name, description, products in that category,
 * subcategories, breadcrumb, and structured data.
 *
 * Category slugs are derived from the categories table slug column
 * or generated from the category name.
 */

import Link from 'next/link'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import SEO from '@/components/SEO'
import JsonLd from '@/components/JsonLd'
import MarketplaceFooter from '@/components/MarketplaceFooter'
import { categorySeoTitle, categorySeoDescription, canonicalUrl, formatPriceGHS } from '@/lib/seo'
import { categorySchema, breadcrumbSchema } from '@/lib/schema'
import { getThumbnailUrl } from '@/lib/cloudinary'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  icon: string
  description?: string | null
  parent_id?: string | null
  slug?: string | null
}

interface Product {
  id: string
  title: string
  price?: number | string | null
  location?: string | null
  image_url?: string | null
  created_at: string
  slug?: string | null
}

interface Props {
  category: Category | null
  subcategories: Category[]
  products: Product[]
  catSlug: string
}

// ─── Helper: derive slug from category ───────────────────────────────────────

function toCatSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── SSR ──────────────────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { slug } = context.params || {}

  if (!slug || typeof slug !== 'string') {
    return { notFound: true }
  }

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Try to find category by slug column first, then by name-derived slug
  let categoryData: Category | null = null

  const { data: bySlug } = await supabaseServer
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (bySlug) {
    categoryData = bySlug
  } else {
    // Fallback: load all categories and find by name-derived slug
    const { data: allCats } = await supabaseServer.from('categories').select('*')
    if (allCats) {
      categoryData = allCats.find((c: Category) => toCatSlug(c.name) === slug) || null
    }
  }

  if (!categoryData) {
    // If category not found in DB, but it's one of our canonical site links,
    // synthesize a category object so it renders an empty state instead of 404.
    const canonicalCategories: Record<string, { name: string, description: string, icon: string }> = {
      'farm-machinery-equipment': { name: 'Farm Machinery & Equipment', icon: '🚜', description: 'Find farm machinery and agricultural equipment in Ghana including knapsack sprayers, irrigation tools, farm tools, and machinery from trusted sellers on AgriBuyX.' },
      'seeds': { name: 'Seeds', icon: '🌱', description: 'Browse agricultural seeds for sale in Ghana from trusted sellers on AgriBuyX.' },
      'fertilizers': { name: 'Fertilizers', icon: '🌾', description: 'Find fertilizers and soil enhancers for sale in Ghana from verified sellers.' },
      'crop-protection': { name: 'Crop Protection', icon: '🛡️', description: 'Find crop protection products, pesticides, and herbicides for sale in Ghana.' },
      'livestock-supplies': { name: 'Livestock Supplies', icon: '🐄', description: 'Browse livestock supplies, feed, and equipment in Ghana.' },
      'irrigation-watering': { name: 'Irrigation & Watering', icon: '💧', description: 'Find irrigation equipment and watering tools for agriculture in Ghana.' },
    }

    if (canonicalCategories[slug]) {
      categoryData = {
        id: `synthetic-${slug}`,
        slug: slug,
        ...canonicalCategories[slug]
      }
    } else {
      return { notFound: true }
    }
  }

  // Fetch subcategories
  const { data: subcats } = await supabaseServer
    .from('categories')
    .select('*')
    .eq('parent_id', categoryData.id)

  // Fetch all category IDs to query (parent + subcategories)
  const allCatIds = [categoryData.id, ...(subcats || []).map((c: Category) => c.id)]

  // Fetch products in this category (and subcategories)
  const { data: products } = await supabaseServer
    .from('products')
    .select('id, title, price, location, image_url, created_at, slug')
    .in('category_id', allCatIds)
    .order('created_at', { ascending: false })
    .limit(60)

  return {
    props: {
      category: categoryData,
      subcategories: subcats || [],
      products: products || [],
      catSlug: slug,
    },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryPage({ category, subcategories, products, catSlug }: Props) {
  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Category not found</h1>
          <Link href="/products" className="text-emerald-700 font-semibold hover:text-emerald-800">
            Browse all products
          </Link>
        </div>
      </div>
    )
  }

  const seoInput = { name: category.name, description: category.description, slug: catSlug }
  const seoTitle = categorySeoTitle(seoInput)
  const seoDescription = categorySeoDescription(seoInput)
  const canonical = canonicalUrl(`/categories/${catSlug}`)

  const schemaData = categorySchema({
    name: category.name,
    description: category.description,
    slug: catSlug,
    productCount: products.length,
  })

  const breadcrumbItems = [
    { name: 'Home', url: canonicalUrl('/') },
    { name: 'Products', url: canonicalUrl('/products') },
    { name: category.name, url: canonical },
  ]

  const productUrl = (p: Product) => p.slug ? `/products/${p.slug}` : `/products/${p.id}`

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title={seoTitle} description={seoDescription} canonical={canonical} />
      <JsonLd schema={schemaData} id="category-schema" />
      <JsonLd schema={breadcrumbSchema(breadcrumbItems)} id="breadcrumb-schema" />

      {/* Skip to content */}
      <a href="#category-products" className="skip-to-content">Skip to products</a>

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

      {/* Category header */}
      <header className="border-b border-slate-200 bg-white px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
              <li><Link href="/products" className="hover:text-emerald-700">Home</Link></li>
              <li aria-hidden="true"><span className="mx-1">/</span></li>
              <li><Link href="/products" className="hover:text-emerald-700">Products</Link></li>
              <li aria-hidden="true"><span className="mx-1">/</span></li>
              <li className="font-medium text-slate-900" aria-current="page">{category.name}</li>
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            {category.icon && (
              <span className="text-4xl" aria-hidden="true">{category.icon}</span>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">
                {category.name} Products in Ghana
              </h1>
              {category.description && (
                <p className="mt-1 text-sm text-slate-600 max-w-2xl">{category.description}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">{products.length} product{products.length === 1 ? '' : 's'} available</p>
            </div>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Subcategories">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/products?category=${sub.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition"
                >
                  <span aria-hidden="true">{sub.icon}</span>
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Products */}
      <main id="category-products" className="mx-auto max-w-7xl px-4 py-8">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-slate-900">No products in this category yet</p>
            <p className="mt-1 text-sm text-slate-600">Check back soon, or browse all products.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
            {products.map((product) => (
              <Link key={product.id} href={productUrl(product)} className="group block">
                <article className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-slate-50">
                    {product.image_url ? (
                      <img
                        src={getThumbnailUrl(product.image_url, 400, 300)}
                        alt={`${product.title} for sale in Ghana on AgriBuyX`}
                        className="h-full w-full object-contain p-1 transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No image</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-900">
                      {product.title}
                    </h2>
                    <p className="mt-1.5 text-base font-bold text-emerald-700">{formatPriceGHS(product.price)}</p>
                    {product.location && (
                      <p className="mt-1 truncate text-xs text-slate-500">📍 {product.location}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link href="/products" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            ← View all products
          </Link>
        </div>
      </main>

      <MarketplaceFooter />
    </div>
  )
}
