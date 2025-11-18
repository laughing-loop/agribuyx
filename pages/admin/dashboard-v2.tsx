import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

interface Admin {
  id: string
  email: string
  name: string
}

export default function AdminDashboardV2() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'vendors'>('products')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    } else {
      setAdmin(JSON.parse(token))
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Dashboard v2
            </p>
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">AgriBuyX Admin</h1>
            <p className="hidden text-sm text-gray-600 sm:block">{admin?.name || admin?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-red-700 md:px-4 md:text-sm"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
        <nav className="border-t bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex gap-2 overflow-x-auto py-2">
              <TabPill
                label="Products"
                value="products"
                active={activeTab === 'products'}
                onClick={() => setActiveTab('products')}
              />
              <TabPill
                label="Categories"
                value="categories"
                active={activeTab === 'categories'}
                onClick={() => setActiveTab('categories')}
              />
              <TabPill
                label="Vendors"
                value="vendors"
                active={activeTab === 'vendors'}
                onClick={() => setActiveTab('vendors')}
              />
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 md:py-6">
        {activeTab === 'products' && <ProductsTab admin={admin} />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'vendors' && <VendorsTab />}
      </main>
    </div>
  )
}

type TabKey = 'products' | 'categories' | 'vendors'

function TabPill({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: TabKey
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-green-600 text-white shadow-sm'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

function ProductsTab({ admin }: { admin: Admin | null }) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [categorySearch, setCategorySearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    location: '',
    contact_phone: '',
    condition: 'New',
    warranty: 'No',
    warranty_period: '',
    features: '',
    image_urls: [] as string[],
    image_url_input: '' as string,
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categorySearch.trim() === '') {
      setFilteredCategories(categories)
    } else {
      const term = categorySearch.toLowerCase()
      setFilteredCategories(
        categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(term) ||
            (cat.description || '').toLowerCase().includes(term)
        )
      )
    }
  }, [categorySearch, categories])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    const cats = data || []
    setCategories(cats)
    setFilteredCategories(cats)
  }

  const handleAddProduct = async (e: any) => {
    e.preventDefault()

    const mainImageUrl =
      formData.image_urls.length > 0
        ? formData.image_urls[0]
        : 'https://via.placeholder.com/300x200?text=Product+Image'

    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id,
          location: formData.location,
          image_url: mainImageUrl,
          condition: formData.condition,
          warranty: formData.warranty,
          warranty_period: formData.warranty_period,
          features: formData.features,
          contact_phone: formData.contact_phone,
          created_by: admin?.id || null,
        },
      ])
      .select()

    if (!productError && productData && productData[0]) {
      const productId = productData[0].id

      for (const imageUrl of formData.image_urls) {
        await supabase.from('product_images').insert([
          {
            product_id: productId,
            image_url: imageUrl,
          },
        ])
      }

      setFormData({
        title: '',
        description: '',
        price: '',
        category_id: '',
        location: '',
        contact_phone: '',
        condition: 'New',
        warranty: 'No',
        warranty_period: '',
        features: '',
        image_urls: [],
        image_url_input: '',
      })
      setFormStep(1)
      setShowForm(false)
      setLoading(true)
      fetchProducts()
    } else if (productError) {
      alert('Error creating product: ' + productError.message)
    }
  }

  const handleAddImageUrl = () => {
    if (formData.image_url_input.trim() === '') {
      alert('Please enter a valid image URL')
      return
    }

    if (formData.image_urls.includes(formData.image_url_input.trim())) {
      alert('This URL is already added')
      return
    }

    setFormData({
      ...formData,
      image_urls: [...formData.image_urls, formData.image_url_input.trim()],
      image_url_input: '',
    })
  }

  const handleRemoveImageUrl = (index: number) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls.filter((_, i) => i !== index),
    })
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="text-sm text-gray-600">Manage marketplace listings.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 md:w-auto"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
          <form onSubmit={handleAddProduct} className="space-y-4 md:space-y-6">
            {/* Step indicator */}
            <div className="flex items-center justify-between text-xs font-medium text-gray-600">
              <div className="flex gap-2">
                {['Basics', 'Details', 'Media'].map((label, index) => {
                  const step = index + 1
                  const active = formStep === step
                  const completed = formStep > step
                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 ${
                        active
                          ? 'bg-green-100 text-green-700'
                          : completed
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px]">
                        {step}
                      </span>
                      <span>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 1: Basic info */}
            {formStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Title *"
                    value={formData.title}
                    onChange={(value) => setFormData({ ...formData, title: value })}
                    placeholder="e.g. Fresh Tomatoes"
                    required
                  />
                  <InputField
                    label="Price (GHS) *"
                    type="number"
                    value={formData.price}
                    onChange={(value) => setFormData({ ...formData, price: value })}
                    placeholder="0.00"
                    required
                  />
                  <InputField
                    label="Location *"
                    value={formData.location}
                    onChange={(value) => setFormData({ ...formData, location: value })}
                    placeholder="e.g. Kumasi, Central Region"
                    required
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Product Category"
                    >
                      <option value="">Select category</option>
                      {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Showing {filteredCategories.length} categories
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 md:w-auto"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {formStep === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Contact Phone"
                    value={formData.contact_phone}
                    onChange={(value) => setFormData({ ...formData, contact_phone: value })}
                    placeholder="e.g. +233 xxx xxx xxx"
                  />
                  <SelectField
                    label="Condition"
                    value={formData.condition}
                    onChange={(value) => setFormData({ ...formData, condition: value })}
                    options={[
                      { value: 'New', label: 'New' },
                      { value: 'Like New', label: 'Like New' },
                      { value: 'Good', label: 'Good' },
                      { value: 'Fair', label: 'Fair' },
                      { value: 'Needs Repair', label: 'Needs Repair' },
                    ]}
                    placeholder="Select condition"
                  />
                  <SelectField
                    label="Warranty"
                    value={formData.warranty}
                    onChange={(value) => setFormData({ ...formData, warranty: value })}
                    options={[
                      { value: 'No', label: 'No Warranty' },
                      { value: 'Yes', label: 'Has Warranty' },
                    ]}
                    placeholder="Select warranty"
                  />
                  {formData.warranty === 'Yes' && (
                    <InputField
                      label="Warranty Period"
                      value={formData.warranty_period}
                      onChange={(value) => setFormData({ ...formData, warranty_period: value })}
                      placeholder="e.g. 1 year, 6 months"
                    />
                  )}
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 md:w-auto"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStep(3)}
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 md:w-auto"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Media & description */}
            {formStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Product Image URLs</label>
                  <div className="flex gap-2 mb-3 flex-col sm:flex-row">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url_input}
                      onChange={(e) => setFormData({ ...formData, image_url_input: e.target.value })}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                    >
                      + Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">First image will be used as the main product image.</p>

                  {formData.image_urls.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.image_urls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-10 w-10 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'
                            }}
                          />
                          <span className="flex-1 truncate text-xs text-gray-600">{url}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(index)}
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <p className="text-xs text-green-600">
                        {formData.image_urls.length} image(s) added
                      </p>
                    </div>
                  )}
                </div>

                <TextAreaField
                  label="Description"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  rows={3}
                  placeholder="Detailed product description..."
                />

                <TextAreaField
                  label="Features / Specifications"
                  value={formData.features}
                  onChange={(value) => setFormData({ ...formData, features: value })}
                  rows={3}
                  placeholder="e.g. - High quality\n- Fresh produce\n- Pesticide free"
                />

                <div className="flex justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 md:w-auto"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 md:w-auto"
                  >
                    Create Product
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-600">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
          No products yet. Use "Add Product" to create your first listing.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDeleted={() => {
                setLoading(true)
                fetchProducts()
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [categorySearch, setCategorySearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categorySearch.trim() === '') {
      setFilteredCategories(categories)
    } else {
      const term = categorySearch.toLowerCase()
      setFilteredCategories(
        categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(term) ||
            (cat.description || '').toLowerCase().includes(term)
        )
      )
    }
  }, [categorySearch, categories])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    setCategories(data || [])
    setFilteredCategories(data || [])
    setLoading(false)
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-600">Browse product categories.</p>
        </div>
        <div className="w-full md:w-72">
          <label className="sr-only" htmlFor="category-search">
            Search categories
          </label>
          <input
            id="category-search"
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-600">Loading categories...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 text-3xl">{cat.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
              {cat.description && (
                <p className="mt-1 text-sm text-gray-600">{cat.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function VendorsTab() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    const { data } = await supabase.from('vendors').select('*')
    setVendors(data || [])
    setLoading(false)
  }

  const handleInvite = async (e: any) => {
    e.preventDefault()
    const token = Math.random().toString(36).substring(7)

    const { error } = await supabase.from('vendor_invites').insert([
      {
        email: inviteEmail,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ])

    if (!error) {
      setInviteEmail('')
      alert(`Invite sent to ${inviteEmail}`)
    } else {
      alert('Error sending invite: ' + error.message)
    }
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Invite Vendor</h2>
        <form onSubmit={handleInvite} className="flex flex-col gap-3 md:flex-row">
          <input
            type="email"
            placeholder="Vendor email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 md:px-6"
          >
            Send Invite
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-600">Loading vendors...</div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Business</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{vendor.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {vendor.business_name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          vendor.is_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {vendor.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {vendors.length === 0 && (
            <div className="py-8 text-center text-gray-600">
              <p>No vendors yet.</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ProductCard({ product, onDeleted }: { product: any; onDeleted: () => void }) {
  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return

    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (!error) {
      onDeleted()
    } else {
      alert('Error deleting product: ' + error.message)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.title}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
          {product.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-green-600">
          GHS ₵{parseFloat(product.price).toLocaleString()}
        </p>
        {product.location && (
          <p className="mt-1 text-sm text-gray-600">{product.location}</p>
        )}
        {product.description && <MultiLineText text={product.description} />}
        {product.features && <MultiLineText text={product.features} />}
        <button
          type="button"
          onClick={handleDelete}
          className="mt-3 w-full rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function MultiLineText({ text }: { text: string }) {
  if (!text) return null

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)

  if (lines.length === 0) return null

  const allBullets = lines.every((line) => line.startsWith('-'))

  if (allBullets) {
    return (
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-600">
        {lines.map((line, index) => (
          <li key={index}>{line.replace(/^-+\s*/, '')}</li>
        ))}
      </ul>
    )
  }

  return (
    <p className="mt-2 whitespace-pre-line text-xs text-gray-600">
      {text}
    </p>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">{placeholder || 'Select an option'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
