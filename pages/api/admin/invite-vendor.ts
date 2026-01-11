import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { config } from '@/lib/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // Verify we have the service role key
    if (!config.supabase.serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
        return res.status(500).json({
            error: 'Server configuration error: Missing service role key. Please ask the administrator to configure it.'
        })
    }

    const { email } = req.body

    if (!email) {
        return res.status(400).json({ error: 'Email is required' })
    }

    try {
        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            config.supabase.url,
            config.supabase.serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Create the database record FIRST
        // This ensures the user shows up in the UI even if the email fails
        const { error: dbError } = await supabaseAdmin
            .from('vendor_invites')
            .insert([{
                email,
                token: Math.random().toString(36).substring(7),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }])

        if (dbError) {
            console.error('Database record error:', dbError)
            throw new Error(`Failed to record invitation in database: ${dbError.message}`)
        }

        // 2. Send Auth Invite SECOND
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
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
