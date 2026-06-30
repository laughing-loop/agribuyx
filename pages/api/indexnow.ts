import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = process.env.INDEXNOW_KEY

  if (!key) {
    // Fail safely if INDEXNOW_KEY is not configured
    return res.status(200).json({ message: 'IndexNow is not configured on this environment.' })
  }

  // Support single URL submission via GET /api/indexnow?url=...
  if (req.method === 'GET') {
    const { url } = req.query
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid url parameter' })
    }

    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.hostname !== 'agribuyx.com' && parsedUrl.hostname !== 'www.agribuyx.com') {
        return res.status(400).json({ error: 'Only agribuyx.com URLs are allowed' })
      }
      
      const bingUrl = `https://www.bing.com/indexnow?url=${encodeURIComponent(url)}&key=${key}`
      const response = await fetch(bingUrl)
      
      if (response.ok) {
        return res.status(200).json({ message: 'URL submitted to IndexNow successfully', url })
      } else {
        const errorText = await response.text()
        return res.status(response.status).json({ error: `IndexNow submission failed: ${errorText}` })
      }
    } catch (error: any) {
      return res.status(400).json({ error: 'Invalid URL provided', details: error.message })
    }
  }

  // Support batch URL submission via POST
  if (req.method === 'POST') {
    const { urls } = req.body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid urls array' })
    }

    // Validate URLs to ensure they belong to agribuyx.com
    const validUrls = urls.filter((url: string) => {
      try {
        const parsedUrl = new URL(url)
        return parsedUrl.hostname === 'agribuyx.com' || parsedUrl.hostname === 'www.agribuyx.com'
      } catch {
        return false
      }
    })

    if (validUrls.length === 0) {
      return res.status(400).json({ error: 'No valid agribuyx.com URLs provided' })
    }

    try {
      const payload = {
        host: 'agribuyx.com',
        key: key,
        keyLocation: `https://agribuyx.com/${key}.txt`,
        urlList: validUrls
      }

      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        return res.status(200).json({ message: 'URLs submitted to IndexNow successfully', count: validUrls.length })
      } else {
        const errorText = await response.text()
        return res.status(response.status).json({ error: `IndexNow submission failed: ${errorText}` })
      }
    } catch (error: any) {
      return res.status(500).json({ error: 'Internal server error', details: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
