import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdminClient, isSuperAdminEmail } from '@/lib/supabase-admin'
import { getApiUser } from '@/lib/supabase-api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { email, userId, fullName, isAdmin } = req.body

    if (!email || !userId) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        const user = await getApiUser(req, res)
        if (!user?.email || user.id !== userId || user.email.toLowerCase() !== String(email).toLowerCase()) {
            return res.status(403).json({ error: 'You can only synchronize your own signed-in profile' })
        }

        const supabaseAdmin = createSupabaseAdminClient()

        if (isAdmin) {
            if (!isSuperAdminEmail(user.email)) {
                return res.status(403).json({ error: 'Only recognized Super Admins can sync to the admin table.' })
            }

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
            const { data: invite } = await supabaseAdmin
                .from('vendor_invites')
                .select('id')
                .eq('email', user.email)
                .maybeSingle()

            if (!invite) {
                return res.status(403).json({ error: 'This account has not been invited as a vendor.' })
            }

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
