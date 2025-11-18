import { supabase } from '@/lib/supabase'

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const { email, password, full_name } = req.body

    try {
      const { data, error } = await supabase.from('admins').insert([
        {
          email,
          password_hash: password, // In production, use bcrypt!
          full_name,
          is_active: true,
        },
      ])

      if (error) throw error

      res.status(200).json({ message: 'Admin created', data })
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
