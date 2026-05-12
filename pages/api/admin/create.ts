import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error:
      'This endpoint has been disabled. Create administrators through Supabase Auth, then sync a recognized super-admin profile from the dashboard.',
  })
}
