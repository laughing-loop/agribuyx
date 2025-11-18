import { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if admin exists in our admins table
      const { data: admin, error: queryError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single()

      if (queryError || !admin) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // For now, simple password check (in production, use proper hashing)
      if (admin.password_hash !== password) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Store admin session in localStorage
      localStorage.setItem('adminToken', JSON.stringify({
        id: admin.id,
        email: admin.email,
        name: admin.full_name,
      }))

      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-3 flex justify-center">
          <Image
            src="/agribuyx_logo-02.svg"
            alt="AgriBuyX"
            width={160}
            height={40}
            className="h-10 w-auto"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="admin@agribuyx.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-600 text-sm text-center mt-4">
          Demo credentials:<br/>
          Email: admin@agribuyx.com<br/>
          Password: demo123
        </p>
      </div>
    </div>
  )
}
