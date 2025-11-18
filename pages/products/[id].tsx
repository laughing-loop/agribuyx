import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  title: string
  description: string
  price: number
  location: string
  image_url: string
  category_id: string
  created_at: string
  condition?: string
  warranty?: string
  warranty_period?: string
  features?: string
  contact_phone?: string
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
  return url
}

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<ProductImage[]>([])
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

      const { data: imageData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productData.id)

      setImages(imageData || [])

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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
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
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Product not found</p>
            <Link href="/products" className="text-green-600 hover:text-green-700 font-semibold">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
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
              className="text-gray-700 hover:text-green-700 font-medium hidden xs:inline-flex"
            >
              Shop
            </Link>
            <Link
              href="/blog"
              className="text-gray-700 hover:text-green-700 font-medium hidden sm:inline-flex"
            >
              Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <Link
          href="/products"
          className="text-green-600 hover:text-green-700 font-semibold mb-3 inline-block text-sm"
        >
          ← Back to Products
        </Link>

        {/* Breadcrumb-style context */}
        <div className="text-xs text-gray-500 mb-4 flex flex-wrap items-center gap-1">
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
          <span className="truncate max-w-[10rem] sm:max-w-xs font-medium text-gray-700">
            {product.title}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-8 lg:grid-cols-12">
          {/* LEFT COLUMN: Image gallery */}
          <div className="md:col-span-4 lg:col-span-5">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              {images.length > 0 ? (
                <>
                  <img
                    src={getWatermarkedImageUrl(images[0].image_url)}
                    alt={product.title}
                    className="w-full h-80 md:h-96 object-cover"
                  />
                  {images.length > 1 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-3 py-3">
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((img) => (
                          <img
                            key={img.id}
                            src={getWatermarkedImageUrl(img.image_url)}
                            alt={product.title}
                            className="h-16 w-full cursor-pointer rounded object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : product.image_url ? (
                <img
                  src={getWatermarkedImageUrl(product.image_url)}
                  alt={product.title}
                  className="w-full h-80 md:h-96 object-cover"
                />
              ) : (
                <div className="w-full h-80 md:h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Product info */}
          <div className="md:col-span-4 lg:col-span-4 space-y-4">
            {category && (
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.title}</h1>
              <button
                type="button"
                onClick={toggleWishlist}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isInWishlist
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{isInWishlist ? '❤' : '♡'}</span>
                <span>{isInWishlist ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📍 {product.location}</span>
            </div>

            <div className="mt-4 pt-4 space-y-4 border-t border-gray-100">
              <div className="pb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{product.description}</p>
              </div>

              {product.features && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Features & Specifications</h3>
                  <div className="rounded-lg bg-gray-50 p-3">
                    {product.features.split('\n').map((feature: string, idx: number) => (
                      feature.trim() && (
                        <p key={idx} className="text-sm text-gray-700 py-0.5 break-words">
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
            <aside className="rounded-lg bg-white p-4 shadow lg:sticky lg:top-24 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Price</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  GHS ₵{product.price.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Condition</p>
                  <p className="font-semibold">{product.condition || 'New'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Warranty</p>
                  <p className="font-semibold">
                    {product.warranty === 'Yes' ? `✓ ${product.warranty_period}` : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Location</p>
                  <p className="font-semibold">📍 {product.location}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Posted</p>
                  <p className="font-semibold">{new Date(product.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">Contact seller</h3>
                <div className="flex flex-col gap-2">
                  <a
                    href={(() => {
                      const raw = product.contact_phone || ''
                      const digits = raw.replace(/[^0-9]/g, '')
                      const message = encodeURIComponent(`I'm interested in ${product.title}`)
                      return digits
                        ? `https://wa.me/${digits}?text=${message}`
                        : `https://wa.me/?text=${message}`
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-green-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={(() => {
                      const url = `https://agribuyx.com/products/${product.id}`
                      const text = encodeURIComponent(`I'm interested in ${product.title}`)
                      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-blue-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    📢 Telegram
                  </a>
                  <a
                    href={`mailto:support@agribuyx.com?subject=Interested in ${product.title}`}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    📧 Email
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                <button
                  type="button"
                  onClick={() => handleShare('whatsapp')}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 hover:text-green-800"
                >
                  <span>Share via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>Copy link</span>
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Similar products</h2>
          {relatedProducts.length === 0 ? (
            <p className="text-sm text-gray-600 bg-white rounded-lg py-6 text-center">
              No similar products to show yet.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.slice(0, relatedVisibleCount).map((item) => (
                  <Link key={item.id} href={`/products/${item.id}`}>
                    <div className="cursor-pointer overflow-hidden rounded-lg bg-white shadow hover:shadow-md">
                      {item.image_url ? (
                        <img
                          src={getWatermarkedImageUrl(item.image_url)}
                          alt={item.title}
                          className="h-32 w-full object-cover"
                        />
                      ) : (
                        <div className="h-32 w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs text-gray-500 mb-1 truncate">
                          {category?.name || 'Product'}
                        </p>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-green-600">
                          GHS ₵{item.price.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          📍 {item.location}
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
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Load more similar products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-20">
        <p>&copy; 2025 AgriBuyX. All rights reserved. | agribuyx.com</p>
      </footer>
    </div>
  )
}
