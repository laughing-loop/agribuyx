import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Vendor {
    id: string
    email: string
    business_name?: string | null
    is_verified?: boolean | null
    created_at: string
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchVendors()
    }, [])

    const fetchVendors = async () => {
        const { data, error } = await supabase
            .from('vendors')
            .select('id, email, business_name, is_verified, created_at')
            .order('created_at', { ascending: false })

        if (error) {
            setMessage({ type: 'error', text: `Could not load vendors: ${error.message}` })
            setVendors([])
        } else {
            setVendors((data || []) as Vendor[])
        }
        setLoading(false)
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setInviting(true)
        setMessage(null)

        try {
            const response = await fetch('/api/admin/invite-vendor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invite')
            }

            setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}!` })
            setInviteEmail('')
            fetchVendors()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setInviting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <div className="grid gap-5 md:grid-cols-12 md:items-start">
                    <div className="md:col-span-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Vendor access
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-950">Invite Vendor</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Send an invite email. The vendor sets a password, then gets access to manage their listings.
                        </p>
                    </div>
                    <form onSubmit={handleInvite} className="md:col-span-8">
                        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                            Email Address
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="h-11 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                placeholder="vendor@example.com"
                                required
                            />
                            <button
                                type="submit"
                                disabled={inviting}
                                className="h-11 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {inviting ? 'Sending...' : 'Send Invite'}
                            </button>
                        </div>

                        {message && (
                            <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${message.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                                }`}>
                                {message.text}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div>
                        <h3 className="text-lg font-bold leading-6 text-slate-950">Active Vendors</h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-600">
                        Registered vendor accounts that can manage marketplace listings.
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="font-semibold text-slate-950">{vendors.length}</span> vendor{vendors.length === 1 ? '' : 's'}
                    </div>
                </div>
                <div className="border-t border-slate-200">
                    {loading ? (
                        <div className="space-y-3 p-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="h-14 animate-pulse rounded-lg bg-slate-100" />
                            ))}
                        </div>
                    ) : vendors.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-600">
                            No vendors yet. Send your first invite above.
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-slate-200">
                            {vendors.map((vendor) => (
                                <li key={vendor.id} className="px-4 py-4 sm:px-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center">
                                            <div className="shrink-0">
                                                <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                                    <svg className="h-7 w-7 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <div className="ml-3 min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-950">{vendor.email}</p>
                                                {vendor.business_name && (
                                                    <p className="truncate text-xs text-slate-600">{vendor.business_name}</p>
                                                )}
                                                <p className="text-xs text-slate-500">Joined {new Date(vendor.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${vendor.is_verified === false
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                {vendor.is_verified === false ? 'Pending' : 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
