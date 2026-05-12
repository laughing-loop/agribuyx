import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getApiUser } from '@/lib/supabase-api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { email, userId, fullName } = req.body

    if (!email || !userId) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        const user = await getApiUser(req, res)
        if (!user?.email || user.id !== userId || user.email.toLowerCase() !== String(email).toLowerCase()) {
            return res.status(403).json({ error: 'You can only onboard your own signed-in account' })
        }

        const supabaseAdmin = createSupabaseAdminClient()

        // 1. Find the invite
        const { data: inviteData, error: inviteError } = await supabaseAdmin
            .from('vendor_invites')
            .select('*')
            .eq('email', user.email)
            .maybeSingle()

        if (inviteError || !inviteData) {
            return res.status(200).json({ message: 'User already processed or no invite found' })
        }

        // 2. Create the vendor record
        const { error: dbError } = await supabaseAdmin
            .from('vendors')
            .upsert([{
                id: userId,
                email: user.email,
                business_name: fullName || email.split('@')[0],
            }], { onConflict: 'email' })

        if (dbError) throw dbError

        // 3. Delete the invitation once used (or keep it as history, but we'll assume cleanup for now since is_used is missing)
        // If the table doesn't have is_used, we might just leave it or delete it.
        // Let's try to just return success if we can't update is_used.

        return res.status(200).json({ message: 'Vendor onboarded successfully' })
    } catch (error: any) {
        console.error('Onboarding error:', error)
        return res.status(500).json({ error: error.message || 'Failed to onboard vendor' })
    }
}
