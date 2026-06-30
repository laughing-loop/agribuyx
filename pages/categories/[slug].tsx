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
import {
  CANONICAL_CATEGORIES,
  type CanonicalCategorySlug,
  categoryMatchesCanonicalSlug,
  getCanonicalCategory,
  getCanonicalCategoryIds,
  inferProductCanonicalCategorySlug,
  productMatchesCanonicalCategory,
  toCategorySlug,
} from '@/lib/categoryMap'

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
  description?: string | null
  price?: number | string | null
  location?: string | null
  image_url?: string | null
  category_id?: string | null
  created_at: string
  slug?: string | null
}

interface Props {
  category: Category | null
  subcategories: Category[]
  products: Product[]
  catSlug: string
  allCategories: Category[]
}

function isCanonicalCategorySlug(value: string): value is CanonicalCategorySlug {
  return CANONICAL_CATEGORIES.some((category) => category.slug === value)
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { slug } = context.params || {}

  if (!slug || typeof slug !== 'string') {
    return { notFound: true }
  }

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: categoriesData } = await supabaseServer
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  const allCategories = (categoriesData || []) as Category[]
  const categoriesById = new Map(allCategories.map((category) => [category.id, category]))
  const canonicalCategory = isCanonicalCategorySlug(slug) ? getCanonicalCategory(slug) : undefined

  let categoryData: Category | null = null
  let subcategories: Category[] = []
  let canonicalCategoryIds = new Set<string>()

  if (canonicalCategory) {
    const matchingRootCategories = allCategories.filter((category) =>
      categoryMatchesCanonicalSlug(category, canonicalCategory.slug)
    )
    canonicalCategoryIds = new Set(getCanonicalCategoryIds(allCategories, canonicalCategory.slug))
    const primaryDbCategory = matchingRootCategories[0]

    categoryData = {
      id: primaryDbCategory?.id || `canonical-${canonicalCategory.slug}`,
      name: canonicalCategory.name,
      icon: primaryDbCategory?.icon || canonicalCategory.icon,
      description: canonicalCategory.description,
      parent_id: null,
      slug: canonicalCategory.slug,
    }

    const rootIds = new Set(matchingRootCategories.map((category) => category.id))
    subcategories = allCategories.filter((category) => category.parent_id && rootIds.has(category.parent_id))
  } else {
    categoryData = allCategories.find((category) => toCategorySlug(category.slug || category.name) === slug) || null

    if (!categoryData) {
      return { notFound: true }
    }

    const directIds = new Set<string>([categoryData.id])
    let changed = true
    while (changed) {
      changed = false
      for (const category of allCategories) {
        if (category.parent_id && directIds.has(category.parent_id) && !directIds.has(category.id)) {
          directIds.add(category.id)
          changed = true
        }
      }
    }
    canonicalCategoryIds = directIds
    subcategories = allCategories.filter((category) => category.parent_id === categoryData?.id)
  }

  const { data: productsData } = await supabaseServer
    .from('products')
    .select('id, title, description, price, location, image_url, category_id, created_at, slug')
    .order('created_at', { ascending: false })
    .limit(500)

  const products = ((productsData || []) as Product[])
    .filter((product) => {
      if (product.category_id && canonicalCategoryIds.has(product.category_id)) return true
      if (!canonicalCategory) return false
      return productMatchesCanonicalCategory(product, canonicalCategory.slug, categoriesById)
    })
    .slice(0, 60)

  return {
    props: {
      category: categoryData,
      subcategories,
      products,
      catSlug: slug,
      allCategories,
    },
  }
}

export default function CategoryPage({ category, subcategories, products, catSlug, allCategories }: Props) {
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
  const categoriesById = new Map(allCategories.map((item) => [item.id, item]))

  const schemaData = categorySchema({
    name: category.name,
    description: category.description,
    slug: catSlug,
    productCount: products.length,
  })

  const breadcrumbItems = [
    { name: 'Home', url: canonicalUrl('/') },
    { name: 'Marketplace', url: canonicalUrl('/products') },
    { name: category.name, url: canonical },
  ]

  const productUrl = (product: Product) => product.slug ? `/products/${product.slug}` : `/products/${product.id}`
  const productCategoryLabel = (product: Product) => {
    if (product.category_id && categoriesById.has(product.category_id)) {
      return categoriesById.get(product.category_id)?.name || category.name
    }

    const inferred = inferProductCanonicalCategorySlug(product)
    return getCanonicalCategory(inferred)?.name || category.name
  }

  const relatedCategories = CANONICAL_CATEGORIES.filter((item) => item.slug !== catSlug)

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title={seoTitle} description={seoDescription} canonical={canonical} />
      <JsonLd schema={schemaData} id="category-schema" />
      <JsonLd schema={breadcrumbSchema(breadcrumbItems)} id="breadcrumb-schema" />

      <a href="#category-products" className="skip-to-content">Skip to products</a>

      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Main navigation">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-4 py-3">
          <Link href="/" aria-label="AgriBuyX home">
            <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3 overflow-x-auto text-sm font-medium text-slate-700 md:gap-5">
            <Link href="/products" className="whitespace-nowrap hover:text-emerald-700">Marketplace</Link>
            <Link href="/categories/farm-machinery-equipment" className="hidden whitespace-nowrap hover:text-emerald-700 sm:inline-block">Farm Machinery</Link>
            <Link href="/categories/seeds" className="hidden whitespace-nowrap hover:text-emerald-700 sm:inline-block">Seeds</Link>
            <Link href="/categories/fertilizers" className="hidden whitespace-nowrap hover:text-emerald-700 md:inline-block">Fertilizers</Link>
            <Link href="/blog" className="whitespace-nowrap hover:text-emerald-700">Blog</Link>
            <Link href="/admin/login" className="whitespace-nowrap hover:text-emerald-700">Vendor</Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-slate-200 bg-white px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
              <li><Link href="/" className="hover:text-emerald-700">Home</Link></li>
              <li aria-hidden="true"><span className="mx-1">/</span></li>
              <li><Link href="/products" className="hover:text-emerald-700">Marketplace</Link></li>
              <li aria-hidden="true"><span className="mx-1">/</span></li>
              <li className="font-medium text-slate-900" aria-current="page">{category.name}</li>
            </ol>
          </nav>

          <div className="flex items-start gap-3">
            {category.icon && (
              <span className="text-4xl" aria-hidden="true">{category.icon}</span>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">
                {category.name} in Ghana
              </h1>
              {category.description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{category.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-500">{products.length} product{products.length === 1 ? '' : 's'} available</p>
            </div>
          </div>

          {subcategories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Subcategories">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/products?category=${sub.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <span aria-hidden="true">{sub.icon}</span>
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main id="category-products" className="mx-auto max-w-7xl px-4 py-8">
        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-slate-900">No products in this category yet</p>
            <p className="mt-1 text-sm text-slate-600">Check back soon, or browse all products.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
            {products.map((product) => (
              <Link key={product.id} href={productUrl(product)} className="group block">
                <article className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-slate-50">
                    {product.image_url ? (
                      <img
                        src={getThumbnailUrl(product.image_url, 400, 300)}
                        alt={`${product.title} for sale in Ghana on AgriBuyX`}
                        className="h-full w-full object-contain p-1 transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                        width={400}
                        height={300}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No image</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        {productCategoryLabel(product)}
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Available
                      </span>
                    </div>
                    <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-950">
                      {product.title}
                    </h2>
                    <p className="mt-2 text-lg font-bold text-emerald-700">{formatPriceGHS(product.price)}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
                      <span className="truncate">{product.location || 'Ghana'}</span>
                      <span className="shrink-0 font-semibold text-slate-600">View details</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        <section className="mt-10 border-t border-slate-200 pt-6" aria-label="Related categories">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Related categories</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedCategories.map((related) => (
              <Link
                key={related.slug}
                href={`/categories/${related.slug}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {related.name}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 text-center">
          <Link href="/products" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            View all products
          </Link>
        </div>
      </main>

      <MarketplaceFooter />
    </div>
  )
}
