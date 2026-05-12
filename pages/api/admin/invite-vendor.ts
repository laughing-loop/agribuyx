import type { NextApiRequest, NextApiResponse } from 'next'
import { config } from '@/lib/config'
import { createSupabaseAdminClient, isSuperAdminEmail } from '@/lib/supabase-admin'
import { getApiUser } from '@/lib/supabase-api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { email } = req.body

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email is required' })
    }

    try {
        const user = await getApiUser(req, res)
        if (!user?.email) {
            return res.status(401).json({ error: 'Authentication required' })
        }

        const supabaseAdmin = createSupabaseAdminClient()
        const { data: adminRow } = await supabaseAdmin
            .from('admins')
            .select('id')
            .eq('email', user.email)
            .maybeSingle()

        if (!adminRow && !isSuperAdminEmail(user.email)) {
            return res.status(403).json({ error: 'Only administrators can invite vendors' })
        }

        // 1. Create the database record FIRST
        // This ensures the user shows up in the UI even if the email fails
        const { error: dbError } = await supabaseAdmin
            .from('vendor_invites')
            .insert([{
                email: email.trim().toLowerCase(),
                token: Math.random().toString(36).substring(7),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }])

        if (dbError) {
            console.error('Database record error:', dbError)
            throw new Error(`Failed to record invitation in database: ${dbError.message}`)
        }

        // 2. Send Auth Invite SECOND
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email.trim().toLowerCase(), {
            redirectTo: `${config.app.url}/admin/update-password`
        })

        if (error) {
            // Rollback DB record if auth fails? 
            // For now, let's keep it so they can "retry" sending the invite from UI.
            throw error
        }

        return res.status(200).json({ message: 'Invitation sent successfully', user: data.user })
    } catch (error: any) {
        console.error('Invite error:', error)
        return res.status(500).json({ error: error.message || 'Failed to send invitation' })
    }
}
