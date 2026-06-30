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
import { CANONICAL_CATEGORIES } from '@/lib/categoryMap'

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

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

export default function Homepage({ featuredProducts }: Props) {
  const seoTitle = 'AgriBuyX | Agricultural Marketplace in Ghana'
  const seoDescription =
    'AgriBuyX is an agricultural marketplace in Ghana for seeds, fertilizers, crop protection, livestock supplies, farm machinery, and equipment from trusted vendors.'
  const canonical = canonicalUrl('/')
  const productUrl = (product: Product) => product.slug ? `/products/${product.slug}` : `/products/${product.id}`

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO title={seoTitle} description={seoDescription} canonical={canonical} />
      <JsonLd schema={organizationSchema()} id="org-schema" />
      <JsonLd schema={websiteSchema()} id="website-schema" />
      <JsonLd schema={siteNavigationElementSchema()} id="sitenav-schema" />

      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Main navigation">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" aria-label="AgriBuyX home" className="shrink-0">
            <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" priority />
          </Link>

          <div className="hidden items-center gap-5 text-sm font-medium text-slate-700 lg:flex">
            <Link href="/products" className="hover:text-emerald-700">Marketplace</Link>
            <Link href="/categories/farm-machinery-equipment" className="hover:text-emerald-700">Farm Machinery</Link>
            <Link href="/categories/seeds" className="hover:text-emerald-700">Seeds</Link>
            <Link href="/categories/fertilizers" className="hover:text-emerald-700">Fertilizers</Link>
            <Link href="/categories/crop-protection" className="hover:text-emerald-700">Crop Protection</Link>
            <Link href="/blog" className="hover:text-emerald-700">Blog</Link>
            <Link href="/admin/login" className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Vendor Office</Link>
          </div>

          <details className="relative lg:hidden">
            <summary className="list-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 marker:hidden">
              Menu
            </summary>
            <div className="absolute right-0 mt-2 grid w-64 gap-1 rounded-lg border border-slate-200 bg-white p-2 text-sm font-medium text-slate-700 shadow-lg">
              <Link href="/products" className="rounded-md px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800">Marketplace</Link>
              <Link href="/categories/farm-machinery-equipment" className="rounded-md px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800">Farm Machinery</Link>
              <Link href="/categories/seeds" className="rounded-md px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800">Seeds</Link>
              <Link href="/categories/fertilizers" className="rounded-md px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800">Fertilizers</Link>
              <Link href="/categories/crop-protection" className="rounded-md px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800">Crop Protection</Link>
              <Link href="/blog" className="rounded-md px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800">Blog</Link>
              <Link href="/admin/login" className="rounded-md bg-slate-900 px-3 py-2 text-white">Vendor Office</Link>
            </div>
          </details>
        </div>
      </nav>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16 lg:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">AgriBuyX Ghana</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Agricultural Marketplace in Ghana
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Buy and discover seeds, fertilizers, crop protection products, livestock supplies, farm machinery, and equipment from trusted vendors across Ghana.
              </p>

              <form action="/products" method="get" className="mt-8 max-w-2xl">
                <label htmlFor="homepage-search" className="sr-only">Search marketplace</label>
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm sm:flex-row">
                  <input
                    id="homepage-search"
                    name="q"
                    type="search"
                    placeholder="Search seeds, fertilizers, sprayers, tools..."
                    className="min-h-11 flex-1 rounded-lg border border-transparent bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/products" className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  Browse Marketplace
                </Link>
                <Link href="/admin/login" className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                  Vendor Office
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-2 gap-3">
                {CANONICAL_CATEGORIES.slice(0, 4).map((category) => (
                  <Link key={category.slug} href={`/categories/${category.slug}`} className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm">
                    <span className="text-2xl" aria-hidden="true">{category.icon}</span>
                    <h2 className="mt-3 text-sm font-bold text-slate-950 group-hover:text-emerald-700">{category.name}</h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{category.shortDescription}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 md:py-14">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">Shop by Category</h2>
              <p className="mt-1 text-sm text-slate-600">Start from the main agricultural buying areas on AgriBuyX.</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              View all products
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CANONICAL_CATEGORIES.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-2xl" aria-hidden="true">{category.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-emerald-700">{category.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{category.shortDescription}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 md:py-14">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Why AgriBuyX</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['Ghana-focused marketplace', 'Built around agricultural buying and selling needs across Ghana.'],
                ['Farm inputs and equipment', 'Browse crop inputs, livestock supplies, tools, and machinery in one place.'],
                ['Vendor product discovery', 'Help buyers find products from agricultural sellers more easily.'],
                ['Direct seller contact', 'Contact sellers directly to confirm pricing, condition, and pickup details.'],
                ['Safer buying reminders', 'Clear reminders help buyers verify listings before payment.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-12 md:py-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">Featured Products</h2>
                <p className="mt-1 text-sm text-slate-600">A small sample of recent marketplace listings.</p>
              </div>
              <Link href="/products" className="hidden text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:block">
                View all products
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={productUrl(product)} className="group block h-full">
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
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Listed</span>
                        {product.location && <span className="truncate text-[11px] text-slate-500">{product.location}</span>}
                      </div>
                      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-950">
                        {product.title}
                      </h3>
                      <p className="mt-2 text-base font-bold text-emerald-700">{formatPriceGHS(product.price)}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-slate-100">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-950">Buyers</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Browse agricultural products, compare listings, and contact sellers directly before buying.</p>
              <Link href="/products" className="mt-5 inline-flex rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                Browse products
              </Link>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-950">Vendors</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Access the vendor office to manage marketplace listings and product information.</p>
              <Link href="/admin/login" className="mt-5 inline-flex rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                Access Vendor Office
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <p className="text-sm text-slate-500">
              <strong>Buyer note:</strong> Always verify sellers and products before making payments. AgriBuyX connects buyers directly with vendors.
            </p>
          </div>
        </section>
      </main>

      <MarketplaceFooter />
    </div>
  )
}
