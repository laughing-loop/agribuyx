// Route /admin/dashboard now uses the v2 implementation.
// We keep the legacy implementation below for reference only.
import AdminDashboardV2 from './dashboard-v2'

export default AdminDashboardV2
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

interface Admin {
  id: string
  email: string
  name: string
}

function AdminDashboardLegacy() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 md:hidden">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">AgriBuyX</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm"
              title="Logout"
            >
              🚪
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
              title="Menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="bg-gray-50 border-t px-4 py-3 space-y-2">
            <div className="text-sm text-gray-600 mb-3">
              {admin?.name || admin?.email}
            </div>
            <TabButton
              label="📦 Products"
              active={activeTab === 'products'}
              onClick={() => {
                setActiveTab('products')
                setMobileMenuOpen(false)
              }}
            />
            <TabButton
              label="📂 Categories"
              active={activeTab === 'categories'}
              onClick={() => {
                setActiveTab('categories')
                setMobileMenuOpen(false)
              }}
            />
            <TabButton
              label="👥 Vendors"
              active={activeTab === 'vendors'}
              onClick={() => {
                setActiveTab('vendors')
                setMobileMenuOpen(false)
              }}
            />
          </nav>
        )}
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block bg-white shadow-md sticky top-0 z-50">
        <div className="px-4 py-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700">AgriBuyX Admin</h1>
              <p className="text-gray-600 text-sm">Welcome, {admin?.name || admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Tabs */}
      <div className="hidden md:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex gap-8">
            <TabButton
              label="📦 Products"
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              desktop
            />
            <TabButton
              label="📂 Categories"
              active={activeTab === 'categories'}
              onClick={() => setActiveTab('categories')}
              desktop
            />
            <TabButton
              label="👥 Vendors"
              active={activeTab === 'vendors'}
              onClick={() => setActiveTab('vendors')}
              desktop
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {activeTab === 'products' && <ProductsTab admin={admin} />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'vendors' && <VendorsTab />}
      </main>
    </div>
  )
}

function TabButton({ label, active, onClick, desktop = false }: any) {
  if (desktop) {
    return (
      <button
        onClick={onClick}
        className={`py-4 px-1 border-b-2 font-semibold transition whitespace-nowrap ${
          active
            ? 'text-green-600 border-green-600'
            : 'text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`w-full py-2 px-4 rounded-lg font-medium transition ${
        active
          ? 'bg-green-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )
}

function ProductsTab({ admin }: { admin: Admin | null }) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    location: '',
    image_urls: [] as string[],
    image_url_input: '' as string,
    condition: 'New',
    warranty: 'No',
    warranty_period: '',
    features: '',
    contact_phone: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    // Filter categories based on search
    if (categorySearch.trim() === '') {
      setFilteredCategories(categories)
    } else {
      setFilteredCategories(
        categories.filter(cat =>
          cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
          cat.description.toLowerCase().includes(categorySearch.toLowerCase())
        )
      )
    }
  }, [categorySearch, categories])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use first image as main image, or placeholder
    const mainImageUrl = formData.image_urls.length > 0 ? formData.image_urls[0] : 'https://via.placeholder.com/300x200?text=Product+Image'
    
    // Create product first
    const { data: productData, error: productError } = await supabase.from('products').insert([
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
        created_by: admin?.id,
      },
    ]).select()

    if (!productError && productData && productData[0]) {
      // Now add each image to product_images table
      const productId = productData[0].id
      
      for (const imageUrl of formData.image_urls) {
        await supabase.from('product_images').insert([
          {
            product_id: productId,
            image_url: imageUrl,
          },
        ])
      }

      // Reset form
      setFormData({ 
        title: '', 
        description: '', 
        price: '', 
        category_id: '', 
        location: '', 
        image_urls: [],
        image_url_input: '',
        condition: 'New',
        warranty: 'No',
        warranty_period: '',
        features: '',
        contact_phone: '',
      })
      setCategorySearch('')
      setShowForm(false)
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
    
    // Check if URL is already added
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
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-3 rounded-lg font-medium transition text-sm md:text-base"
      >
        {showForm ? '✕ Cancel' : '+ Add Product'}
      </button>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4 md:space-y-6">
            {/* Single Column on Mobile, Two Columns on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <InputField
                  label="Product Title *"
                  type="text"
                  placeholder="e.g., Fresh Tomatoes"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                  required
                  helper="Use a clear, descriptive name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategorySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <select
                    value={formData.category_id}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mt-2 text-sm"
                    required
                    aria-label="Product Category"
                  >
                    <option value="">Select Category</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Showing {filteredCategories.length} categories</p>
                </div>

                <InputField
                  label="Price (GHS ₵) *"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: e.target.value })}
                  required
                  step="0.01"
                />

                <InputField
                  label="Location *"
                  type="text"
                  placeholder="e.g., Kumasi, Central Region"
                  value={formData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                  required
                />

                <InputField
                  label="Contact Phone"
                  type="tel"
                  placeholder="+233 xxx xxx xxx"
                  value={formData.contact_phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <SelectField
                  label="Condition"
                  value={formData.condition}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, condition: e.target.value })}
                  options={['New', 'Like New', 'Good', 'Fair', 'Needs Repair']}
                />

                <SelectField
                  label="Warranty"
                  value={formData.warranty}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, warranty: e.target.value })}
                  options={['No', 'Yes']}
                />

                {formData.warranty === 'Yes' && (
                  <InputField
                    label="Warranty Period"
                    type="text"
                    placeholder="e.g., 1 year"
                    value={formData.warranty_period}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, warranty_period: e.target.value })}
                  />
                )}

                {/* Image URLs Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image URLs</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url_input}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image_url_input: e.target.value })}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddImageUrl()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition"
                    >
                      + Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">First image is the main product image</p>

                  {formData.image_urls.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {formData.image_urls.map((url, index) => (
                        <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              (e.target as any).src = 'https://via.placeholder.com/50?text=Invalid'
                            }}
                          />
                          <span className="text-xs text-gray-600 flex-1 truncate">Image {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(index)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <p className="text-xs text-green-600">✓ {formData.image_urls.length} image(s) added</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Width Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                placeholder="Detailed product description..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features/Specifications</label>
              <textarea
                placeholder="e.g. - High quality&#10;- Fresh produce&#10;- Pesticide free"
                value={formData.features}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, features: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
            >
              ✓ Create Product
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onDelete={() => fetchProducts()} />
          ))}
        </div>
      )}
    </div>
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
    // Filter categories based on search
    if (categorySearch.trim() === '') {
      setFilteredCategories(categories)
    } else {
      setFilteredCategories(
        categories.filter(cat =>
          cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
          cat.description.toLowerCase().includes(categorySearch.toLowerCase())
        )
      )
    }
  }, [categorySearch, categories])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true })
    setCategories(data || [])
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search categories..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm md:text-base"
        />
        <p className="text-sm text-gray-600 mt-2">
          Showing <strong>{filteredCategories.length}</strong> of <strong>{categories.length}</strong> categories
        </p>
      </div>

      {loading ? (
        <p className="text-center py-12">Loading categories...</p>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3 className="font-semibold text-lg text-gray-800">{cat.name}</h3>
              <p className="text-gray-600 text-sm mt-2">{cat.description}</p>
              {cat.helper_text && <p className="text-gray-500 text-xs mt-2 italic">💡 {cat.helper_text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = Math.random().toString(36).substring(7)
    
    await supabase.from('vendor_invites').insert([
      {
        email: inviteEmail,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ])

    setInviteEmail('')
    alert(`Invite sent to ${inviteEmail}`)
  }

  return (
    <div>
      <form onSubmit={handleInvite} className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Invite Vendor</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="email"
            placeholder="Vendor email"
            value={inviteEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm md:text-base"
            required
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition whitespace-nowrap text-sm md:text-base">
            Send Invite
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-center py-12">Loading vendors...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                    <td className="px-4 py-3 text-gray-600">{vendor.business_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vendor.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
            <div className="text-center py-12 text-gray-600">
              <p>No vendors yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, onDelete }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {product.image_url && (
        <img src={product.image_url} alt={product.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{product.title}</h3>
        <p className="text-green-600 font-bold text-xl mb-2">GHS ₵{parseFloat(product.price).toLocaleString()}</p>
        <p className="text-gray-600 text-sm mb-2">{product.location}</p>
        <p className="text-gray-500 text-xs mb-3">{product.condition || 'New'}</p>
        <button
          onClick={async () => {
            if (confirm('Delete this product?')) {
              await supabase.from('products').delete().eq('id', product.id)
              onDelete()
            }
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium text-sm transition"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function InputField({ label, helper, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm" />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm" aria-label={label}>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
