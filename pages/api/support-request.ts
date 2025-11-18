import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, category, message } = req.body || {}

  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' })
  }

  try {
    const { error: insertError } = await supabase.from('support_requests').insert([
      {
        name: name || null,
        email,
        category: category || null,
        message,
      },
    ])

    if (insertError) {
      console.error('Error saving support request', insertError)
    }
  } catch (error) {
    console.error('Unexpected error inserting support request', error)
  }

  const smtpHost = process.env.SUPPORT_SMTP_HOST || 'smtp.hostinger.com'
  const smtpPort = parseInt(process.env.SUPPORT_SMTP_PORT || '465', 10)
  const smtpSecure = (process.env.SUPPORT_SMTP_SECURE || 'true') === 'true'
  const smtpUser = process.env.SUPPORT_SMTP_USER
  const smtpPass = process.env.SUPPORT_SMTP_PASS
  const toEmail = process.env.SUPPORT_TO_EMAIL || 'support@agribuyx.com'
  const fromEmail = process.env.SUPPORT_FROM_EMAIL || 'support@agribuyx.com'

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: `[AgriBuyX Support] ${category || 'New message'} from ${email}`,
        text: `Name: ${name || '-'}\nEmail: ${email}\nTopic: ${category || '-'}\n\n${message}`,
      })
    } catch (error) {
      console.error('Error sending support email', error)
    }
  }

  return res.status(200).json({ ok: true })
}
