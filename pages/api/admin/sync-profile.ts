import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { config } from '@/lib/config'

// Replicate the SUPER_ADMINS list from the frontend for security
const SUPER_ADMINS = ['support@agribuyx.com', 'admin@agribuyx.com', 'jolydoh4@gmail.com']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { email, userId, fullName, isAdmin } = req.body

    if (!email || !userId) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    // Security check: Only allow syncing for recognized Super Admins if isAdmin is true
    if (isAdmin) {
        const isSuper = SUPER_ADMINS.includes(email) || email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
        if (!isSuper) {
            return res.status(403).json({ error: 'Only recognized Super Admins can sync to the admin table.' })
        }
    }

    if (!config.supabase.serviceRoleKey) {
        return res.status(500).json({ error: 'Server configuration error: Service Role Key missing' })
    }

    try {
        const supabaseAdmin = createClient(
            config.supabase.url,
            config.supabase.serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        if (isAdmin) {
            // Upsert into admins table
            const { error } = await supabaseAdmin
                .from('admins')
                .upsert({
                    id: userId,
                    email: email,
                    full_name: fullName || email.split('@')[0],
                    is_active: true
                }, { onConflict: 'email' })
            if (error) throw error
        } else {
            // Upsert into vendors table
            const { error } = await supabaseAdmin
                .from('vendors')
                .upsert({
                    id: userId,
                    email: email,
                    business_name: fullName || email.split('@')[0]
                }, { onConflict: 'email' })
            if (error) throw error
        }

        return res.status(200).json({ message: 'Profile synced successfully' })
    } catch (error: any) {
        console.error('Profile sync error:', error)
        return res.status(500).json({ error: error.message || 'Failed to sync profile' })
    }
}
