import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminIndex() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to admin dashboard
        router.replace('/admin/dashboard')
    }, [router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <p className="text-gray-600">Redirecting to admin dashboard...</p>
        </div>
    )
}
