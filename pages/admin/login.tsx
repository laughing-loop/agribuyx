import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import AdminAuthShell from '@/components/AdminAuthShell'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [view, setView] = useState<'login' | 'forgot_password'>('login')

  useEffect(() => {
    // Check if already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/admin/dashboard')
      }
    }
    checkUser()
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (view === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/update-password`,
        })
        if (error) throw error
        setMessage('Check your email for the password reset link!')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        if (data.session) {
          router.push('/admin/dashboard')
        }
      }
    } catch (err: any) {
      // Don't log expected auth errors to console to avoid confusing Dev Overlay
      if (err.message !== 'Invalid login credentials') {
        console.error('Auth error:', err)
      }

      // Map technical errors to user-friendly messages
      if (err.message === 'Invalid login credentials') {
        setError('Incorrect email or password. Please try again.')
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.')
      } else if (err.name === 'AuthRetryableFetchError' || err.message.includes('Failed to fetch')) {
        setError('Network error: Unable to connect to authentication server. Please check your internet connection or configuration.')
      } else {
        setError(err.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    if (view === 'forgot_password') return 'Reset Password'
    return 'Welcome Back'
  }

  const getSubtitle = () => {
    if (view === 'forgot_password') return 'Enter your email to receive a reset link'
    return 'Sign in to manage your AgriBuyX store'
  }

  const getButtonText = () => {
    if (loading) return 'Processing...'
    if (view === 'forgot_password') return 'Send Reset Link'
    return 'Sign In'
  }

  return (
    <AdminAuthShell
      eyebrow={view === 'forgot_password' ? 'Account Recovery' : 'Vendor Office'}
      title={getTitle()}
      subtitle={getSubtitle()}
    >
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                placeholder="vendor@agribuyx.com"
                required
              />
            </div>
          </div>

          {view === 'login' && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => { setView('forgot_password'); setError(''); setMessage(''); }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {message && (
            <div className="flex rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-r-transparent mr-2"></div>
                {getButtonText()}
              </>
            ) : getButtonText()}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          {view === 'forgot_password' && (
            <p className="text-sm text-slate-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setMessage(''); }}
                className="font-semibold text-emerald-700 hover:underline focus:outline-none"
              >
                Back to Login
              </button>
            </p>
          )}
          {view === 'login' && (
            <p className="text-sm text-slate-600">
              No account yet? <a href="mailto:support@agribuyx.com" className="font-semibold text-emerald-700 hover:underline">Contact an administrator</a> for an invite.
            </p>
          )}
        </div>
    </AdminAuthShell>
  )
}
