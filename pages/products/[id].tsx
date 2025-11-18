import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
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

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

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

      // Fetch category info
      if (productData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', productData.category_id)
          .single()

        setCategory(categoryData)
      }
    }
    setLoading(false)
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
            <Link href="/" className="text-2xl font-bold text-green-700">
              AgriBuyX
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-green-700">
            AgriBuyX
          </Link>
        </div>
      </nav>

      {/* Product Detail */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/products" className="text-green-600 hover:text-green-700 font-semibold mb-6 inline-block">
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow p-8">
          {/* Product Image */}
          <div>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {category && (
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                {category.icon} {category.name}
              </div>
            )}

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>

            <p className="text-3xl font-bold text-green-600 mb-4">
              ₦{product.price.toLocaleString()}
            </p>

            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <span>📍</span>
              <span>{product.location}</span>
            </div>

            <div className="prose mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Contact Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Seller</h3>
              <div className="flex gap-4">
                <a
                  href={`https://wa.me/?text=I'm interested in ${product.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-center transition"
                >
                  💬 WhatsApp
                </a>
                <a
                  href={`mailto:support@agribuyx.com?subject=Interested in ${product.title}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-center transition"
                >
                  📧 Email
                </a>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Condition</p>
                  <p className="font-semibold text-gray-800">{product.condition || 'New'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Warranty</p>
                  <p className="font-semibold text-gray-800">{product.warranty === 'Yes' ? `✓ ${product.warranty_period}` : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Location</p>
                  <p className="font-semibold text-gray-800">📍 {product.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Posted</p>
                  <p className="font-semibold text-gray-800">{new Date(product.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              {product.features && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Features & Specifications</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {product.features.split('\n').map((feature: string, idx: number) => (
                      feature.trim() && (
                        <p key={idx} className="text-gray-700 py-1">
                          {feature.trim().startsWith('-') ? feature.trim() : `• ${feature.trim()}`}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Products</h2>
          <div className="text-gray-600 text-center py-8">
            Coming soon...
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-20">
        <p>&copy; 2025 AgriBuyX. All rights reserved. | agribuyx.com</p>
      </footer>
    </div>
  )
}
