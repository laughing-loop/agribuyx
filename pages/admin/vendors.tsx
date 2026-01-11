import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface Vendor {
    id: string
    email: string
    created_at: string
    last_sign_in_at: string
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
        // In a real scenario, we might query a public.vendors table or use an admin API 
        // Since we can't list all users from client-side easily without a public table,
        // we'll assume for now we list 'admins' if we had such table, or just show the current user for demo
        // Ideally, we would have a 'profiles' table that links to auth.users.

        // For this demo, let's try to fetch from an imaginary 'vendors' or 'profiles' table
        // If it doesn't exist, we'll just show an empty list or the current user.

        // Fallback to showing just yourself if table doesn't exist
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
            setVendors([{
                id: user.id,
                email: user.email,
                created_at: user.created_at,
                last_sign_in_at: user.last_sign_in_at || new Date().toISOString()
            }])
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
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setInviting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Invite Vendor</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Send an email invitation to a new vendor. They will receive a link to set up their password.
                        </p>
                    </div>
                    <div className="mt-5 md:col-span-2 md:mt-0">
                        <form onSubmit={handleInvite} className="grid grid-cols-1 gap-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                                        placeholder="vendor@example.com"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={inviting}
                                        className="inline-flex justify-center rounded-r-md border border-l-0 border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {inviting ? 'Sending...' : 'Send Invite'}
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Active Vendors</h3>
                    <p className="mt-1 text-max-2xl text-sm text-gray-500">
                        List of currently registered vendors and administrators.
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200">
                            {vendors.map((vendor) => (
                                <li key={vendor.id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                                                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <p className="truncate text-sm font-medium text-green-600">{vendor.email}</p>
                                                <p className="text-xs text-gray-500">Joined: {new Date(vendor.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                Active
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
