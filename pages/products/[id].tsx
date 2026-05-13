import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getWatermarkedImageUrl as getCloudinaryUrl, getThumbnailUrl } from '@/lib/cloudinary'
import MarketplaceFooter from '@/components/MarketplaceFooter'

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
}

interface ProductImage {
  id: string
  product_id: string
  image_url: string
}

function getWatermarkedImageUrl(url: string) {
  if (!url) return url
  return getCloudinaryUrl(url)
}

function formatPrice(price?: number | string | null) {
  const value = Number(price)
  if (!Number.isFinite(value)) return 'Price on request'
  return `GHS ${value.toLocaleString()}`
}

function getListingImageUrl(url: string) {
  if (!url) return url
  return getThumbnailUrl(url, 400, 300)
}

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<ProductImage[]>([])
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [relatedVisibleCount, setRelatedVisibleCount] = useState<number>(4)
  const [isInWishlist, setIsInWishlist] = useState(false)

  const fetchRelatedProducts = async (baseProduct: Product) => {
    if (!baseProduct.category_id) {
      setRelatedProducts([])
      return
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', baseProduct.category_id)
      .neq('id', baseProduct.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRelatedProducts(data as Product[])
    } else {
      setRelatedProducts([])
    }
  }

  useEffect(() => {
    if (!id) return
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    const { data: productData, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && productData) {
      setProduct(productData)

      if (productData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', productData.category_id)
          .single()

        setCategory(categoryData)
      }

      const { data: imageData, error: imageError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productData.id)

      if (imageError && imageError.code !== '42P01') {
        console.warn('Unable to load product images:', imageError.message)
      }

      const imageRows = imageError?.code === '42P01' ? [] : imageData || []
      setImages(imageRows)
      setSelectedImageUrl(imageRows[0]?.image_url || productData.image_url || '')

      if (productData.created_by) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id, business_name, whatsapp_url, facebook_url, tiktok_url, instagram_url')
          .eq('id', productData.created_by)
          .single()

        if (vendorData) {
          setVendor(vendorData)
        }
      }

      await fetchRelatedProducts(productData as Product)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!product) return

    try {
      const stored = JSON.parse(
        typeof window !== 'undefined'
          ? localStorage.getItem('agribuyx_wishlist') || '[]'
          : '[]'
      )
      setIsInWishlist(stored.includes(product.id))
    } catch {
      setIsInWishlist(false)
    }
  }, [product])

  useEffect(() => {
    setRelatedVisibleCount(4)
  }, [product])

  const toggleWishlist = () => {
    if (!product) return

    try {
      const stored = JSON.parse(localStorage.getItem('agribuyx_wishlist') || '[]')
      let next: string[]
      if (stored.includes(product.id)) {
        next = stored.filter((pid: string) => pid !== product.id)
      } else {
        next = [...stored, product.id]
      }
      localStorage.setItem('agribuyx_wishlist', JSON.stringify(next))
      setIsInWishlist(next.includes(product.id))
    } catch {
      // ignore wishlist errors
    }
  }

  const handleShare = (platform: 'whatsapp' | 'facebook') => {
    if (typeof window === 'undefined' || !product) return

    const url = window.location.href
    const text = `I'm interested in ${product.title} on AgriBuyX`
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)

    let shareUrl = ''
    if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const copyLink = () => {
    if (typeof window === 'undefined') return

    try {
      navigator.clipboard?.writeText(window.location.href)
      alert('Link copied to clipboard')
    } catch {
      // ignore clipboard errors
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-72 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-4 space-y-3">
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Link href="/products" className="inline-flex items-center gap-2">
              <Image
                src="/agribuyx_logo-02.svg"
                alt="AgriBuyX"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
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

  const galleryImages =
    images.length > 0
      ? images
      : product.image_url
        ? [{ id: product.id, product_id: product.id, image_url: product.image_url }]
        : []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/products" className="flex items-center gap-2">
            <Image
              src="/agribuyx_logo-02.svg"
              alt="AgriBuyX"
              width={140}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link
              href="/products"
              className="hidden font-medium text-slate-700 hover:text-emerald-700 xs:inline-flex"
            >
              Marketplace
            </Link>
            <Link
              href="/blog"
              className="hidden font-medium text-slate-700 hover:text-emerald-700 sm:inline-flex"
            >
              Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Product Detail */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <Link
          href="/products"
          className="mb-4 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Back to marketplace
        </Link>

        {/* Breadcrumb-style context */}
        <div className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <span>Home</span>
          <span>/</span>
          <span>Products</span>
          {category && (
            <>
              <span>/</span>
              <span className="truncate max-w-[8rem] sm:max-w-xs">{category.name}</span>
            </>
          )}
          <span>/</span>
          <span className="max-w-[10rem] truncate font-medium text-slate-700 sm:max-w-xs">
            {product.title}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-8 lg:grid-cols-12">
          {/* LEFT COLUMN: Image gallery */}
          <div className="md:col-span-4 lg:col-span-5">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              {galleryImages.length > 0 ? (
                <>
                  <img
                    src={getWatermarkedImageUrl(selectedImageUrl || galleryImages[0].image_url)}
                    alt={product.title}
                    className="h-80 w-full object-cover md:h-96"
                  />
                  {galleryImages.length > 1 && (
                    <div className="border-t border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="grid grid-cols-4 gap-2">
                        {galleryImages.map((img) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setSelectedImageUrl(img.image_url)}
                            className={`overflow-hidden rounded-lg border-2 ${selectedImageUrl === img.image_url
                              ? 'border-emerald-600'
                              : 'border-transparent'
                              }`}
                            aria-label={`Show image for ${product.title}`}
                          >
                            <img
                              src={getWatermarkedImageUrl(img.image_url)}
                              alt={product.title}
                              className="h-16 w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-80 w-full items-center justify-center bg-slate-200 md:h-96">
                  <span className="text-sm font-medium text-slate-500">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Product info */}
          <div className="md:col-span-4 lg:col-span-4 space-y-4">
            {category && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">{product.title}</h1>
              <button
                type="button"
                onClick={toggleWishlist}
                className={`inline-flex shrink-0 items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${isInWishlist
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <span className="mr-1">{isInWishlist ? '❤' : '♡'}</span>
                <span>{isInWishlist ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-1">
                {product.location || 'Location not listed'}
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-1">
                Posted {new Date(product.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Description</h3>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {product.features && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">Features & Specifications</h3>
                  <div className="rounded-lg bg-slate-50 p-3">
                    {product.features.split('\n').map((feature: string, idx: number) => (
                      feature.trim() && (
                        <p key={idx} className="break-words py-0.5 text-sm text-slate-700">
                          {feature.trim().startsWith('-') ? feature.trim() : `• ${feature.trim()}`}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Buy / contact box */}
          <div className="md:col-span-8 lg:col-span-3">
            <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Price</p>
                <p className="text-2xl font-bold text-emerald-700 md:text-3xl">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
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
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">Location</p>
                  <p className="font-semibold">{product.location || '-'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">Posted</p>
                  <p className="font-semibold">{new Date(product.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Contact seller</h3>
                  {vendor && (
                    <p className="text-xs text-slate-600">Sold by: <span className="font-medium text-emerald-700">{vendor.business_name}</span></p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={vendor?.whatsapp_url || (() => {
                      const raw = product.contact_phone || ''
                      const digits = raw.replace(/[^0-9]/g, '')
                      const message = encodeURIComponent(`I'm interested in ${product.title}`)
                      return digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    WhatsApp seller
                  </a>

                  {vendor?.facebook_url && (
                    <a
                      href={vendor.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg bg-blue-800 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-900"
                    >
                      FB Facebook
                    </a>
                  )}

                  {vendor?.tiktok_url && (
                    <a
                      href={vendor.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg bg-black py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gray-900"
                    >
                      🎵 TikTok
                    </a>
                  )}

                  {vendor?.instagram_url && (
                    <a
                      href={vendor.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 py-2.5 text-center text-sm font-semibold text-white transition opacity-90 hover:opacity-100"
                    >
                      📸 Instagram
                    </a>
                  )}

                  <a
                    href={`mailto:support@agribuyx.com?subject=Interested in ${product.title}`}
                    className="flex-1 rounded-lg bg-slate-700 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Email support
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
                <button
                  type="button"
                  onClick={() => handleShare('whatsapp')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>Share via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = window.location.href;
                    const text = `I'm interested in ${product.title}`;
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800"
                >
                  <span>Telegram</span>
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900"
                >
                  <span>Copy link</span>
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">Similar products</h2>
          {relatedProducts.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white py-6 text-center text-sm text-slate-600">
              No similar products to show yet.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.slice(0, relatedVisibleCount).map((item) => (
                  <Link key={item.id} href={`/products/${item.id}`} className="group block">
                    <div className="h-full cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                      {item.image_url ? (
                        <img
                          src={getListingImageUrl(item.image_url)}
                          alt={item.title}
                          className="h-32 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center bg-slate-200">
                          <span className="text-xs text-slate-500">No image</span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="mb-1 truncate text-xs text-slate-500">
                          {category?.name || 'Product'}
                        </p>
                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-emerald-700">
                          {formatPrice(item.price)}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.location || 'Location not listed'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {relatedVisibleCount < relatedProducts.length && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setRelatedVisibleCount((prev) => prev + 4)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Load more similar products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MarketplaceFooter />
    </div>
  )
}
