import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { CldUploadWidget } from 'next-cloudinary'
import { config } from '@/lib/config'
import VendorsPage from './vendors'

// Simple role check based on strict email list
const SUPER_ADMINS = ['support@agribuyx.com', 'admin@agribuyx.com', 'jolydoh4@gmail.com'] // Replace with actual owner emails or env var
const isSuperAdmin = (email?: string) => {
  if (!email) return false
  return SUPER_ADMINS.includes(email) || email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}

interface Admin {
  id: string
  email: string
  name: string
  role: 'admin' | 'vendor'
}

export default function AdminDashboardV2() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'vendors' | 'updates' | 'support'>(
    'products'
  )
  const [needsSync, setNeedsSync] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }

      const email = session.user.email!
      let role: 'admin' | 'vendor' = 'vendor'
      let existsInDb = false

      // 1. Check if user is in admins table
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('email', email)
        .single()

      if (adminData) {
        role = 'admin'
        existsInDb = true
      } else {
        // 2. Fallback: check if they are in vendors table
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id')
          .eq('email', email)
          .single()

        if (vendorData) {
          role = 'vendor'
          existsInDb = true
        }
      }

      const superAdminFlag = isSuperAdmin(email)
      if (superAdminFlag) {
        role = 'admin'
      }

      if (!existsInDb) {
        setNeedsSync(true)
      }

      setAdmin({
        id: session.user.id,
        email: email,
        name: session.user.user_metadata.full_name || email.split('@')[0] || 'User',
        role: role,
      })
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleSyncProfile = async () => {
    if (!admin) return
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: admin.email,
          userId: admin.id,
          fullName: admin.name,
          isAdmin: admin.role === 'admin'
        })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Profile synchronized successfully! You can now create products.')
        setNeedsSync(false)
      } else {
        alert('Sync failed: ' + data.error)
      }
    } catch (err: any) {
      alert('Error syncing profile: ' + err.message)
    } finally {
      setSyncing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        {/* Profile Sync Warning for Super Admins */}
        {needsSync && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Profile not synchronized. You might face issues creating products.</span>
              </div>
              <button
                onClick={handleSyncProfile}
                disabled={syncing}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Repair profile'}
              </button>
            </div>
          </div>
        )}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Merchant Portal
            </p>
            <h1 className="truncate text-xl font-bold text-slate-950 md:text-2xl">AgriBuyX Vendor Office</h1>
            <div className="mt-1 hidden items-center gap-2 text-sm text-slate-600 sm:flex">
              <span className="truncate">Welcome, {admin?.name || admin?.email}</span>
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
                {admin?.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 md:px-4 md:text-sm"
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
        <nav className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-2 md:mx-0 md:px-0">
              <TabPill
                label="My Inventory"
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
              {admin?.role === 'admin' && (
                <TabPill
                  label="Vendors"
                  value="vendors"
                  active={activeTab === 'vendors'}
                  onClick={() => setActiveTab('vendors')}
                />
              )}
              <TabPill
                label="Updates & Social"
                value="updates"
                active={activeTab === 'updates'}
                onClick={() => setActiveTab('updates')}
              />
              {admin?.role === 'admin' && (
                <TabPill
                  label="Support Hub"
                  value="support"
                  active={activeTab === 'support'}
                  onClick={() => setActiveTab('support')}
                />
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 md:py-6">
        {activeTab === 'products' && <ProductsTab admin={admin} />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'vendors' && admin?.role === 'admin' && <VendorsPage />}
        {activeTab === 'updates' && <UpdatesTab admin={admin} />}
        {activeTab === 'support' && admin?.role === 'admin' && <SupportTab />}
      </main>
    </div>
  )
}

type TabKey = 'products' | 'categories' | 'vendors' | 'updates' | 'support'

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
      className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${active
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
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
    if (!admin?.id) return

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    // Non-admins (vendors) only see their own products.
    // Admins see everything on the platform.
    if (admin.role !== 'admin') {
      query = query.eq('created_by', admin.id)
    }

    const { data, error } = await query

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

  const resetProductForm = () => {
    setSaveError(null)
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
    setFormMode('create')
    setEditingProduct(null)
  }

  const handleAddProduct = async (e: any) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)

    const mainImageUrl =
      formData.image_urls.length > 0
        ? formData.image_urls[0]
        : 'https://via.placeholder.com/300x200?text=Product+Image'

    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: Number(formData.price),
            category_id: formData.category_id || null,
            location: formData.location.trim(),
            image_url: mainImageUrl,
            condition: formData.condition,
            warranty: formData.warranty,
            warranty_period: formData.warranty_period.trim(),
            features: formData.features.trim(),
            contact_phone: formData.contact_phone.trim(),
            created_by: admin?.id || null,
          },
        ])
        .select()

      if (productError) {
        setSaveError(productError.message)
        return
      }

      if (productData?.[0]?.id) {
        await saveProductImages(productData[0].id, formData.image_urls)
      }

      resetProductForm()
      setShowForm(false)
      setLoading(true)
      fetchProducts()
    } catch (error: any) {
      setSaveError(error.message || 'Unable to create product')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProduct = async (e: any) => {
    e.preventDefault()
    if (!editingProduct) return
    setSaving(true)
    setSaveError(null)

    const mainImageUrl =
      formData.image_urls.length > 0
        ? formData.image_urls[0]
        : editingProduct.image_url ||
        'https://via.placeholder.com/300x200?text=Product+Image'

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          category_id: formData.category_id || null,
          location: formData.location.trim(),
          image_url: mainImageUrl,
          condition: formData.condition,
          warranty: formData.warranty,
          warranty_period: formData.warranty_period.trim(),
          features: formData.features.trim(),
          contact_phone: formData.contact_phone.trim(),
        })
        .eq('id', editingProduct.id)

      if (updateError) {
        setSaveError(updateError.message)
        return
      }

      await replaceProductImages(editingProduct.id, formData.image_urls)

      resetProductForm()
      setShowForm(false)
      setLoading(true)
      fetchProducts()
    } catch (error: any) {
      setSaveError(error.message || 'Unable to update product')
    } finally {
      setSaving(false)
    }
  }

  const saveProductImages = async (productId: string, imageUrls: string[]) => {
    if (imageUrls.length === 0) return

    const { error } = await supabase.from('product_images').insert(
      imageUrls.map((imageUrl) => ({
        product_id: productId,
        image_url: imageUrl,
      }))
    )

    if (error && error.code !== '42P01') {
      console.warn('Unable to save product image gallery:', error.message)
    }
  }

  const replaceProductImages = async (productId: string, imageUrls: string[]) => {
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId)

    if (deleteError && deleteError.code !== '42P01') {
      console.warn('Unable to clear product image gallery:', deleteError.message)
      return
    }

    await saveProductImages(productId, imageUrls)
  }

  const handleSubmitProduct = async (e: any) => {
    if (formMode === 'edit') {
      return handleUpdateProduct(e)
    }
    return handleAddProduct(e)
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

  const handleEditProduct = async (product: any) => {
    setFormMode('edit')
    setEditingProduct(product)
    setShowForm(true)
    setFormStep(1)
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price:
        product.price !== undefined && product.price !== null
          ? String(product.price)
          : '',
      category_id: product.category_id || '',
      location: product.location || '',
      contact_phone: product.contact_phone || '',
      condition: product.condition || 'New',
      warranty: product.warranty || 'No',
      warranty_period: product.warranty_period || '',
      features: product.features || '',
      image_urls: [],
      image_url_input: '',
    })

    const { data: imageRows, error: imageError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)

    if (imageError && imageError.code !== '42P01') {
      console.warn('Unable to load product image gallery:', imageError.message)
    }

    if (imageRows && imageRows.length > 0) {
      setFormData((prev) => ({
        ...prev,
        image_urls: imageRows
          .map((row: any) => row.image_url)
          .filter((url: string | null) => Boolean(url)) as string[],
      }))
    }
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Inventory
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Products</h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage the listings buyers see in the marketplace.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-950">{products.length}</span> listing{products.length === 1 ? '' : 's'}
            </div>
            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetProductForm()
                  setShowForm(false)
                } else {
                  resetProductForm()
                  setShowForm(true)
                }
              }}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
            >
              {showForm ? 'Close form' : 'Add product'}
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <form onSubmit={handleSubmitProduct} className="space-y-4 md:space-y-6">
            {saveError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}

            {/* Step indicator */}
            <div className="-mx-1 overflow-x-auto px-1 text-xs font-medium text-slate-600">
              <div className="flex min-w-max gap-2">
                {['Basics', 'Details', 'Media'].map((label, index) => {
                  const step = index + 1
                  const active = formStep === step
                  const completed = formStep > step
                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : completed
                          ? 'border-slate-200 bg-slate-100 text-slate-700'
                          : 'border-slate-200 bg-white text-slate-500'
                        }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold">
                        {step}
                      </span>
                      <span>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <CldUploadWidget
              uploadPreset={config.cloudinary.uploadPreset}
              onSuccess={(result: any) => {
                if (result.event === 'success') {
                  const imageUrl = result.info.secure_url
                  if (!formData.image_urls.includes(imageUrl)) {
                    setFormData({
                      ...formData,
                      image_urls: [...formData.image_urls, imageUrl],
                    })
                  }
                }
              }}
              options={{
                cloudName: config.cloudinary.cloudName,
                sources: ['local', 'url', 'camera'],
                multiple: true,
                maxFiles: 10,
                styles: {
                  palette: {
                    window: '#FFFFFF',
                    windowBorder: '#90A0B3',
                    tabIcon: '#16a34a',
                    menuIcons: '#5A616A',
                    textDark: '#000000',
                    textLight: '#FFFFFF',
                    link: '#16a34a',
                    action: '#16a34a',
                    inactiveTabIcon: '#0E2F5A',
                    error: '#F44235',
                    inProgress: '#16a34a',
                    complete: '#20B832',
                    sourceBg: '#E4EBF1',
                  },
                },
              }}
            >
              {({ open }: any) => (
                <>
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
                          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                          />
                          <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            aria-label="Product Category"
                          >
                            <option value="">Select category</option>
                            {filteredCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-slate-500">
                            Showing {filteredCategories.length} categories
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setFormStep(2)}
                          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 md:w-auto"
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
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:w-auto"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormStep(3)}
                          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 md:w-auto"
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
                        <label className="mb-1 block text-sm font-medium text-slate-700">Product Images</label>

                        {/* Use a safe check for open */}
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof open === 'function') {
                              open()
                            } else {
                              alert('Upload widget is still loading. Please try again in a moment.')
                            }
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Images from Cloudinary
                        </button>

                        <p className="mt-2 text-xs text-slate-500">
                          First image will be used as the main product image. You can upload multiple images.
                        </p>

                        {formData.image_urls.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {formData.image_urls.map((url, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2"
                              >
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="h-10 w-10 rounded object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'
                                  }}
                                />
                                <span className="flex-1 truncate text-xs text-slate-600">{url}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageUrl(index)}
                                  className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <p className="text-xs font-medium text-emerald-700">
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
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:w-auto"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                        >
                          {saving
                            ? 'Saving...'
                            : formMode === 'edit'
                              ? 'Save changes'
                              : 'Create Product'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CldUploadWidget>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-600">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No products yet. Use "Add Product" to create your first listing.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[460px]:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDeleted={() => {
                setLoading(true)
                fetchProducts()
              }}
              onEdit={handleEditProduct}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function UpdatesTab({ admin }: { admin: Admin | null }) {
  const isAdmin = admin?.role === 'admin'

  if (!admin) {
    return (
      <div className="py-8 text-center text-gray-600">
        Loading permissions...
      </div>
    )
  }

  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  const [posts, setPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postSaving, setPostSaving] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    image_url: '',
    video_url: '',
  })

  useEffect(() => {
    fetchSettings()
    fetchPosts()
  }, [])

  const fetchSettings = async () => {
    if (isAdmin) {
      const { data, error } = await supabase.from('site_settings').select('*')

      if (!error && data) {
        data.forEach((row: any) => {
          if (row.key === 'whatsapp_channel_url') {
            setWhatsappUrl(row.value || '')
          }
          if (row.key === 'tiktok_url') {
            setTiktokUrl(row.value || '')
          }
          if (row.key === 'facebook_url') {
            setFacebookUrl(row.value || '')
          }
        })
      }
    } else if (admin?.id) {
      const { data, error } = await supabase
        .from('vendors')
        .select('whatsapp_url, facebook_url, tiktok_url, instagram_url')
        .eq('id', admin.id)
        .single()

      if (!error && data) {
        setWhatsappUrl(data.whatsapp_url || '')
        setFacebookUrl(data.facebook_url || '')
        setTiktokUrl(data.tiktok_url || '')
        setInstagramUrl(data.instagram_url || '')
      }
    }
    setSettingsLoading(false)
  }

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
    setPostsLoading(false)
  }

  const handleSaveSettings = async (e: any) => {
    e.preventDefault()
    setSettingsSaving(true)

    if (isAdmin) {
      const rows: any[] = []
      rows.push({ key: 'whatsapp_channel_url', value: whatsappUrl })
      rows.push({ key: 'tiktok_url', value: tiktokUrl })
      rows.push({ key: 'facebook_url', value: facebookUrl })

      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' })

      if (error) {
        alert('Error saving platform links: ' + error.message)
      }
    } else if (admin?.id) {
      const { error } = await supabase
        .from('vendors')
        .update({
          whatsapp_url: whatsappUrl,
          facebook_url: facebookUrl,
          tiktok_url: tiktokUrl,
          instagram_url: instagramUrl,
        })
        .eq('id', admin.id)

      if (error) {
        alert('Error saving store links: ' + error.message)
      } else {
        alert('Store social links updated successfully!')
      }
    }

    setSettingsSaving(false)
  }

  const handleCreatePost = async (e: any) => {
    e.preventDefault()
    if (!postForm.title.trim()) {
      alert('Title is required')
      return
    }

    let slug = postForm.slug.trim()
    if (!slug) {
      slug = postForm.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
    }

    if (!slug) {
      alert('Slug could not be generated')
      return
    }

    setPostSaving(true)

    if (editingPostId) {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: postForm.title,
          slug,
          summary: postForm.summary,
          content: postForm.content,
          image_url: postForm.image_url,
          video_url: postForm.video_url,
        })
        .eq('id', editingPostId)

      if (error) {
        alert('Error updating post: ' + error.message)
      } else {
        setEditingPostId(null)
        setPostForm({
          title: '',
          slug: '',
          summary: '',
          content: '',
          image_url: '',
          video_url: '',
        })
        fetchPosts()
      }

      setPostSaving(false)
      return
    }

    const { error } = await supabase.from('blog_posts').insert([
      {
        title: postForm.title,
        slug,
        summary: postForm.summary,
        content: postForm.content,
        image_url: postForm.image_url,
        video_url: postForm.video_url,
      },
    ])

    if (error) {
      alert('Error creating post: ' + error.message)
    } else {
      setPostForm({ title: '', slug: '', summary: '', content: '', image_url: '', video_url: '' })
      fetchPosts()
    }

    setPostSaving(false)
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return

    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) {
      alert('Error deleting post: ' + error.message)
    } else {
      setPosts((prev) => prev.filter((p: any) => p.id !== id))
      if (editingPostId === id) {
        setEditingPostId(null)
        setPostForm({
          title: '',
          slug: '',
          summary: '',
          content: '',
          image_url: '',
          video_url: '',
        })
      }
    }
  }

  const handleEditPost = (post: any) => {
    setEditingPostId(post.id)
    setPostForm({
      title: post.title || '',
      slug: post.slug || '',
      summary: post.summary || '',
      content: post.content || '',
      image_url: post.image_url || '',
      video_url: post.video_url || '',
    })

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Updates & Social</h2>
          <p className="text-sm text-gray-600">
            {isAdmin
              ? 'Manage platform-wide social channels and publish updates for all farmers.'
              : 'Manage your personal store social links to help farmers connect with you directly.'}
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-100 mb-6">
          <p className="text-sm text-green-800">
            👋 <strong>Personalize your store:</strong> Add your social links below. These will help farmers find your profile and contact you directly.
          </p>
        </div>
      )}

      <div className={`space-y-4 ${isAdmin ? 'lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0' : ''}`}>
        {/* Social links column */}
        <div className={isAdmin ? 'lg:col-span-4 xl:col-span-3' : 'max-w-2xl'}>
          <div className="rounded-lg bg-white p-4 shadow-sm md:p-6 lg:sticky lg:top-24">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              {isAdmin ? 'Platform social channels' : 'Your store links'}
            </h3>
            <p className="mb-4 text-xs text-gray-600">
              {isAdmin
                ? 'These links appear as the main platform channels on the shop page.'
                : 'These links will be shown on your products so buyers can follow you.'}
            </p>
            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  {isAdmin ? 'WhatsApp channel link' : 'WhatsApp link (Personal/Business)'}
                </label>
                <input
                  type="url"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder={isAdmin ? "https://whatsapp.com/channel/..." : "https://wa.me/233..."}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">TikTok link</label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@your-handle"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Facebook link</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/your-profile"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {!isAdmin && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Instagram link</label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/your-profile"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={settingsSaving || settingsLoading}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                >
                  {settingsSaving ? 'Saving...' : 'Save links'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-4 lg:col-span-8 xl:col-span-9">
            <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                {editingPostId ? 'Edit update' : 'New update'}
              </h3>
              <p className="mb-4 text-xs text-gray-600">
                Use this for short market updates, platform news, or tips. You can use simple Markdown for
                bullets, links, and extra images.
              </p>
              <form onSubmit={handleCreatePost} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Title *</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="e.g. Maize prices this week"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Slug</label>
                    <input
                      type="text"
                      value={postForm.slug}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      placeholder="auto-generated if left blank"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Image URL</label>
                    <input
                      type="url"
                      value={postForm.image_url}
                      onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })}
                      placeholder="https://example.com/hero-image.jpg"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Video URL</label>
                  <input
                    type="url"
                    value={postForm.video_url}
                    onChange={(e) => setPostForm({ ...postForm, video_url: e.target.value })}
                    placeholder="YouTube link or .mp4/.webm video URL (optional)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Short summary</label>
                  <textarea
                    value={postForm.summary}
                    onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })}
                    rows={2}
                    placeholder="One or two lines explaining the update."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Full content</label>
                  <textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    rows={4}
                    placeholder={'Use paragraphs, lists (- bullet), and Markdown links like [View product](https://agribuyx.com/products/123).'}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={postSaving}
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                  >
                    {postSaving ? (editingPostId ? 'Saving...' : 'Publishing...') : (editingPostId ? 'Save changes' : 'Publish update')}
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Recent updates</h3>
                {postsLoading && <span className="text-xs text-gray-500">Loading...</span>}
              </div>
              {postsLoading ? (
                <div className="py-6 text-center text-sm text-gray-600">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-600">No updates have been published yet.</div>
              ) : (
                <div className="divide-y text-sm">
                  {posts.map((post: any) => (
                    <div key={post.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs text-gray-500">{post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</p>
                        <p className="font-semibold text-gray-900 line-clamp-2">{post.title}</p>
                        {post.summary && <p className="text-xs text-gray-600 line-clamp-2">{post.summary}</p>}
                      </div>
                      <div className="flex items-center gap-2 pt-1 md:pt-0">
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">View</a>
                        <button type="button" onClick={() => handleEditPost(post)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Edit</button>
                        <button type="button" onClick={() => handleDeletePost(post.id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function SupportTab() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'closed'>('all')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from('support_requests').update({ status }).eq('id', id)
    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      setRequests((prev) => prev.map((r: any) => (r.id === id ? { ...r, status } : r)))
    }
  }

  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((req: any) => (req.status || 'new') === statusFilter)

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Support / Complaints</h2>
          <p className="text-sm text-gray-600">
            View messages from the public Support form and track their status.
          </p>
        </div>
        <div className="flex gap-2 text-xs md:text-sm">
          {['all', 'new', 'in_progress', 'closed'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value as any)}
              className={`rounded-full px-3 py-1 font-medium transition ${statusFilter === value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {value === 'all' ? 'All' : value.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
        {loading ? (
          <p className="text-sm text-gray-600">Loading support requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-sm text-gray-600">No support messages yet.</p>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req: any) => (
              <div
                key={req.id}
                className="rounded border border-gray-200 bg-gray-50 p-3 text-sm md:p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-gray-800">
                      {req.email}{' '}
                      {req.name && <span className="text-gray-500">· {req.name}</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {req.category || 'General'} ·{' '}
                      {req.created_at
                        ? new Date(req.created_at).toLocaleString()
                        : 'Unknown time'}
                    </p>
                  </div>
                  <select
                    value={req.status || 'new'}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-xs text-gray-800 md:text-sm">
                  {req.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
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
                        className={`rounded-full px-3 py-1 text-xs font-medium ${vendor.is_verified
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

function ProductCard({
  product,
  onDeleted,
  onEdit,
}: {
  product: any
  onDeleted: () => void
  onEdit: (product: any) => void
}) {
  const price = Number(product.price)
  const displayPrice = Number.isFinite(price) ? price.toLocaleString() : '0'

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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-slate-200 text-xs font-medium text-slate-500">
          No image
        </div>
      )}
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-slate-950">
          {product.title || 'Untitled product'}
        </h3>
        <p className="mt-1 text-sm font-bold text-emerald-700">
          GHS {displayPrice}
        </p>
        {product.location && (
          <p className="mt-1 truncate text-sm text-slate-600">{product.location}</p>
        )}
        {product.description && <MultiLineText text={product.description} />}
        {product.features && <MultiLineText text={product.features} />}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Delete
          </button>
        </div>
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
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
        {lines.map((line, index) => (
          <li key={index}>{line.replace(/^-+\s*/, '')}</li>
        ))}
      </ul>
    )
  }

  return (
    <p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-5 text-slate-600">
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
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
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
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
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
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
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
