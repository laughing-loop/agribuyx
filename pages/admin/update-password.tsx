import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import AdminAuthShell from '@/components/AdminAuthShell'

export default function UpdatePassword() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [authError, setAuthError] = useState<{ title: string; message: string } | null>(null)
    const [sessionVerified, setSessionVerified] = useState(false)
    const [showManualCheck, setShowManualCheck] = useState(false)
    interface DebugInfo {
        hasHash?: boolean
        hashKeys?: string[]
        hasSearch?: boolean
        searchKeys?: string[]
        codePresent?: boolean
        tokenPresent?: boolean
        location?: string
        origin?: string
        exchangeError?: string
        setSessionError?: string
        sessionAtStart?: boolean
        lastEvent?: string
        hasSessionNow?: boolean
    }

    const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
    const [debugVisible, setDebugVisible] = useState(false)

    useEffect(() => {
        const hash = window.location.hash.substring(1)
        const hashParams = new URLSearchParams(hash)
        const queryParams = new URLSearchParams(window.location.search)

        // Check for errors in both hash and query
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code')
        const code = queryParams.get('code')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (errorCode || errorDescription) {
            setAuthError({
                title: errorCode === 'otp_expired' ? 'Link Expired' : 'Invalid Link',
                message: errorDescription?.replace(/\+/g, ' ') || 'This link is invalid or has expired.'
            })
            return
        }

        const initializeSession = async () => {
            const currentHash = window.location.hash
            const currentSearch = window.location.search

            setDebugInfo({
                hasHash: !!currentHash,
                hashKeys: [...hashParams.keys()],
                hasSearch: !!currentSearch,
                searchKeys: [...queryParams.keys()],
                codePresent: !!code,
                tokenPresent: !!accessToken,
                location: window.location.href,
                origin: window.location.origin
            })

            // 1. If we have a PKCE code, exchange it immediately
            if (code) {
                console.log('Detected PKCE code, exchanging for session...')
                const { data, error } = await supabase.auth.exchangeCodeForSession(code)
                if (error) {
                    console.error('Code exchange failed:', error)
                    setDebugInfo((prev: DebugInfo) => ({ ...prev, exchangeError: error.message }))
                    setAuthError({ title: 'Link Expired', message: 'The setup link has already been used or has expired. code: ' + error.message })
                    return
                }
                console.log('Code exchange successful:', data)
            }

            // 1.5 Manually hydrate session if tokens are in the hash but no session exists
            // This is a MISSION CRITICAL fallback for Implicit Flow (hash tokens)
            if (accessToken && refreshToken) {
                console.log('Detected hash tokens, manually setting session...')
                const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })

                if (setSessionError) {
                    console.error('Manual setSession failed:', setSessionError)
                    setDebugInfo((prev: DebugInfo) => ({ ...prev, setSessionError: setSessionError.message }))
                } else if (setSessionData.session) {
                    console.log('Manual setSession successful')
                    setSessionVerified(true)
                    return
                }
            }

            // 2. Check for session
            const { data: { session } } = await supabase.auth.getSession()
            setDebugInfo((prev: DebugInfo) => ({ ...prev, sessionAtStart: !!session }))

            if (session) {
                setSessionVerified(true)
                return
            }

            // 3. Listen for changes (hydration)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state change:', event, !!session)
                setDebugInfo((prev: DebugInfo) => ({ ...prev, lastEvent: event, hasSessionNow: !!session }))
                if (session) {
                    setSessionVerified(true)
                }
            })

            // 4. Final Fallback: Check again after a short delay
            setTimeout(async () => {
                const { data: { session: finalSession } } = await supabase.auth.getSession()
                if (finalSession) {
                    setSessionVerified(true)
                } else if (!code && !accessToken) {
                    // Only redirect if there is NO code and NO token at all
                    router.replace('/admin/login')
                } else if (!sessionVerified) {
                    setShowManualCheck(true)
                }
            }, 5000)

            return () => subscription.unsubscribe()
        }

        initializeSession()
    }, [router])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        try {
            // Hard check for session. If it's missing, try to refresh/wait once more
            let { data: { session: currentSession } } = await supabase.auth.getSession()

            if (!currentSession) {
                // One last try: sometimes the client-side state is slightly behind the event
                await new Promise(r => setTimeout(r, 800))
                const retryCheck = await supabase.auth.getSession()
                currentSession = retryCheck.data.session
            }

            if (!currentSession) {
                throw new Error('Verification in progress. Please wait a second and try clicking "Update Password" again.')
            }

            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setMessage('Password updated successfully! Finalizing your account...')

            // Finalize via API to bypass RLS and ensure records are created
            try {
                const user = currentSession.user
                await fetch('/api/admin/onboard-vendor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        userId: user.id,
                        fullName: user.user_metadata?.full_name
                    })
                })
            } catch (apiErr) {
                console.error('Finalization API failed (silent):', apiErr)
            }

            setTimeout(() => {
                router.push('/admin/dashboard')
            }, 2000)
        } catch (err: any) {
            console.error('Update password error:', err)
            setError(err.message || 'Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    if (authError) {
        return (
            <AdminAuthShell
                eyebrow="Invite link"
                title={authError.title}
                subtitle={authError.message}
            >
                <div className="text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-red-100 p-3">
                            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/admin/login')}
                        className="h-11 w-full rounded-lg bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                        Return to Login
                    </button>
                </div>
            </AdminAuthShell>
        )
    }

    return (
        <AdminAuthShell
            eyebrow="Account setup"
            title="Set new password"
            subtitle="Create a password to finish setting up your AgriBuyX merchant account."
        >
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

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
                        disabled={loading || (!sessionVerified && !authError)}
                        className="flex h-11 w-full items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-r-transparent mr-2"></div>
                                Updating Password...
                            </>
                        ) : !sessionVerified && !authError ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent mr-2"></div>
                                Verifying Link...
                            </>
                        ) : 'Update Password'}
                    </button>

                    {showManualCheck && !sessionVerified && (
                        <div className="mt-4 text-center">
                            <p className="mb-2 text-xs text-slate-500">Taking too long?</p>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const { data } = await supabase.auth.getSession()
                                        if (data.session) setSessionVerified(true)
                                        else {
                                            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
                                            if (refreshData.session) setSessionVerified(true)
                                            else {
                                                setError('Still verifying. Ensure you are on the correct browser tab or try copying the link into a new one.')
                                                setDebugVisible(true)
                                            }
                                        }
                                    }}
                                    className="text-sm font-semibold text-emerald-700 underline hover:text-emerald-800"
                                >
                                    Force Refresh Verification
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                {debugVisible && (
                    <div className="mt-8 overflow-auto rounded bg-slate-100 p-4 font-mono text-[10px]">
                        <p className="mb-2 font-bold text-slate-700">DEBUG DIAGNOSTICS:</p>
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                        <button
                            onClick={() => setDebugVisible(false)}
                            className="mt-2 text-blue-700 underline"
                        >
                            Hide Debug
                        </button>
                    </div>
                )}
        </AdminAuthShell>
    )
}
