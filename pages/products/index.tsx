import { useState, useEffect, useRef } from 'react'
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
}

interface Category {
  id: string
  name: string
  icon: string
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

function getWatermarkedImageUrl(url: string) {
  if (!url) return url
  return url
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [locations, setLocations] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [blogLoading, setBlogLoading] = useState(true)
  const [socialLinks, setSocialLinks] = useState<{ [key: string]: string }>({})
  const [socialLoading, setSocialLoading] = useState(true)
  const [categorySearch, setCategorySearch] = useState<string>('')
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false)
  const [activeMainCategoryId, setActiveMainCategoryId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState<number>(12)
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportError, setSupportError] = useState<string | null>(null)
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null)
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  })
  const filtersRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [selectedCategory])

  useEffect(() => {
    fetchBlogPosts()
    fetchSocialLinks()
  }, [])

  useEffect(() => {
    if (!activeMainCategoryId) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!filtersRef.current) return
      if (!filtersRef.current.contains(event.target as Node)) {
        setActiveMainCategoryId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeMainCategoryId])

  useEffect(() => {
    setVisibleCount(12)
  }, [selectedCategory, searchQuery, selectedLocation])

  const fetchProducts = async () => {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }

    const { data, error } = await query
    if (!error) {
      const items = (data || []) as Product[]
      setProducts(items)

      const uniqueLocations = Array.from(
        new Set(items.map((product) => product.location).filter(Boolean))
      )
      setLocations(uniqueLocations)
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error && data) {
      setBlogPosts(data as BlogPost[])
    }
    setBlogLoading(false)
  }

  const fetchSocialLinks = async () => {
    const { data, error } = await supabase.from('site_settings').select('*')

    if (!error && data) {
      const map: { [key: string]: string } = {}
      data.forEach((row: any) => {
        if (row.key) {
          map[row.key] = row.value || ''
        }
      })
      setSocialLinks(map)
    }
    setSocialLoading(false)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLocation = selectedLocation
      ? product.location === selectedLocation
      : true

    return matchesSearch && matchesLocation
  })

  const mainCategories = categories.filter((cat) => !cat.parent_id)
  const filteredMainCategories = mainCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const visibleMainCategories = showAllCategories
    ? filteredMainCategories
    : filteredMainCategories.slice(0, 10)

  const getSubcategories = (parentId: string) =>
    categories.filter((cat) => cat.parent_id === parentId)

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

  blogPosts.forEach((post) => {
    tickerItems.push(`Blog: ${post.title}`)
  })

  if (socialLinks['whatsapp_channel_url']) {
    tickerItems.push('Join our WhatsApp channel for price alerts and updates')
  }

  const handleSupportSubmit = async (e: any) => {
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
    } catch (error) {
      setSupportError('Network error. Please try again later.')
    } finally {
      setSupportSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <Link href="/products" className="flex items-center gap-2">
              <Image
                src="/agribuyx_logo-02.svg"
                alt="AgriBuyX"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2 md:hidden text-xs font-medium text-gray-700">
              <Link href="/blog" className="hover:text-green-700">
                Blog
              </Link>
              {socialLinks['whatsapp_channel_url'] && (
                <a
                  href={socialLinks['whatsapp_channel_url']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-700"
                >
                  Channel
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 lg:w-96">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-300 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSupportOpen(true)}
                className="hidden md:inline-flex items-center rounded-full border border-green-600 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
              >
                Support / Help
              </button>
            </div>
            <div className="hidden md:flex items-center gap-3 text-sm justify-end">
              <Link
                href="/blog"
                className="inline-flex items-center rounded-full px-3 py-1 font-medium text-gray-700 hover:bg-green-50"
              >
                Blog
              </Link>
              {socialLinks['whatsapp_channel_url'] && (
                <a
                  href={socialLinks['whatsapp_channel_url']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full px-3 py-1 font-medium text-gray-700 hover:bg-green-50"
                >
                  Channel
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {tickerItems.length > 0 && (
        <div className="bg-green-700 text-white text-[11px] sm:text-xs">
          <div className="max-w-7xl mx-auto px-4 py-2 overflow-hidden">
            <div className="ticker-marquee">
              {tickerItems.concat(tickerItems).map((item, index) => (
                <span key={index} className="opacity-90">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Fresh Agricultural Products</h1>
          <p className="text-sm md:text-base text-green-50">
            Discover the finest produce and agri inputs from trusted farmers and vendors.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar - Filters */}
          <div ref={filtersRef} className="lg:col-span-3 relative">
            <div className="bg-white rounded-lg shadow p-6 lg:sticky lg:top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Filters</h3>
              <div className="mb-3">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value)
                    setShowAllCategories(false)
                  }}
                  placeholder="Search categories..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-1 gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition text-sm ${
                    selectedCategory === ''
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  All Products
                </button>
                {visibleMainCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleMainCategoryClick(cat)}
                    className={`w-full rounded-lg transition flex flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] sm:text-xs md:text-sm lg:flex-row lg:items-center lg:justify-between lg:px-4 lg:py-2 ${
                      selectedCategory === cat.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 lg:flex-row lg:items-center lg:gap-2">
                      <span className="text-lg lg:text-base">{cat.icon}</span>
                      <span className="text-center lg:text-left truncate max-w-[4.5rem] sm:max-w-[6rem] md:max-w-none">
                        {cat.name}
                      </span>
                    </div>
                    {getSubcategories(cat.id).length > 0 && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="hidden h-3 w-3 text-gray-500 lg:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
                {filteredMainCategories.length > 10 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-green-700 hover:text-green-800"
                  >
                    {showAllCategories ? 'Show fewer categories' : 'Show all categories'}
                  </button>
                )}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-gray-500">Location</p>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {selectedLocation && (
                  <button
                    type="button"
                    onClick={() => setSelectedLocation('')}
                    className="text-xs text-gray-500 underline"
                  >
                    Clear location
                  </button>
                )}
              </div>
            </div>
            {activeMainCategoryId && (
              <div className="hidden lg:block absolute left-full top-0 ml-4 w-64 rounded-lg bg-white p-4 shadow-lg z-30">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  {categories.find((cat) => cat.id === activeMainCategoryId)?.name}
                </h4>
                <div className="space-y-2">
                  {getSubcategories(activeMainCategoryId).map((subcat) => (
                    <button
                      key={subcat.id}
                      onClick={() => {
                        setSelectedCategory(subcat.id)
                        setActiveMainCategoryId(null)
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                        selectedCategory === subcat.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-1">{subcat.icon}</span>
                      <span>{subcat.name}</span>
                    </button>
                  ))}
                  {getSubcategories(activeMainCategoryId).length === 0 && (
                    <p className="text-xs text-gray-500">No subcategories yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.slice(0, visibleCount).map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <div className="bg-white rounded-lg shadow hover:shadow-lg transition transform hover:scale-105 overflow-hidden cursor-pointer">
                        {product.image_url ? (
                          <img
                            src={getWatermarkedImageUrl(product.image_url)}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-green-600 font-bold text-xl mb-2">
                            GHS ₵{product.price.toLocaleString()}
                          </p>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <p className="text-gray-500 text-sm">
                            📍 {product.location}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {visibleCount < filteredProducts.length && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Load more products
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Updates & Social Column */}
          <div className="lg:col-span-3">
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Updates & Tips</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Market updates, storage tips, and platform news for farmers.
                </p>
                {blogLoading ? (
                  <div className="py-4 text-sm text-gray-600">Loading updates...</div>
                ) : blogPosts.length === 0 ? (
                  <div className="py-4 text-sm text-gray-600">
                    No updates yet. Check back soon.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blogPosts.slice(0, 3).map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`}>
                        <div className="cursor-pointer rounded-lg border border-gray-100 bg-white p-3 shadow-sm hover:border-green-200 hover:bg-green-50">
                          <p className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                            {post.title}
                          </p>
                          {post.summary && (
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                              {post.summary}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Link
                    href="/blog"
                    className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    View all updates
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Join our channels</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get quick updates about prices, new products, and platform changes.
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks['whatsapp_channel_url'] && (
                    <a
                      href={socialLinks['whatsapp_channel_url']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 20l1.5-3A7 7 0 1119 12a7 7 0 01-7 7H5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.5 9.5l1 2 2 1"
                          />
                        </svg>
                      </span>
                      <span>WhatsApp updates</span>
                    </a>
                  )}
                  {socialLinks['tiktok_url'] && (
                    <a
                      href={socialLinks['tiktok_url']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                        >
                          <path d="M9.5 5.5v9.25a2.25 2.25 0 11-1.8-2.2" />
                          <path d="M14.5 5.5c.4.9 1.24 1.74 2.25 2.16V9a4.25 4.25 0 01-2.25-.66v4.41a4.75 4.75 0 11-3.5-4.6V5.5h3.5z" />
                        </svg>
                      </span>
                      <span>TikTok</span>
                    </a>
                  )}
                  {socialLinks['facebook_url'] && (
                    <a
                      href={socialLinks['facebook_url']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                        >
                          <path d="M13 10.5V8.75c0-.62.13-.9 1.02-.9H15V6h-1.56C11.86 6 11 6.86 11 8.54v1.96H9v2.25h2V18h2v-4.25h2V11.5h-2z" />
                        </svg>
                      </span>
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
                {!socialLoading &&
                  !socialLinks['whatsapp_channel_url'] &&
                  !socialLinks['tiktok_url'] &&
                  !socialLinks['facebook_url'] && (
                    <p className="mt-3 text-xs text-gray-500">
                      No social links configured yet. Add them from the admin dashboard.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating support button */}
      <button
        type="button"
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-20 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg md:hidden"
        aria-label="Support and complaints"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 19l1.5-3A7 7 0 0112 5h0a7 7 0 017 7v0a7 7 0 01-7 7H5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 11h.01M12 11h.01M15 11h.01"
          />
        </svg>
      </button>

      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Support / Complaints</h2>
              <button
                type="button"
                onClick={() => {
                  setIsSupportOpen(false)
                  setSupportError(null)
                  setSupportSuccess(null)
                }}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <p className="mb-3 text-xs text-gray-600">
              Tell us what you need help with. We will reply from support@agribuyx.com.
            </p>
            <form onSubmit={handleSupportSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={supportForm.name}
                    onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Topic</label>
                <select
                  value={supportForm.category}
                  onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <label className="mb-1 block text-xs font-medium text-gray-700">Message *</label>
                <textarea
                  rows={4}
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {supportError && <p className="text-xs text-red-600">{supportError}</p>}
              {supportSuccess && <p className="text-xs text-green-600">{supportSuccess}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSupportOpen(false)
                    setSupportError(null)
                    setSupportSuccess(null)
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={supportSubmitting}
                  className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                >
                  {supportSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-20">
        <p>&copy; 2025 AgriBuyX. All rights reserved. | agribuyx.com</p>
      </footer>
    </div>
  )
}
