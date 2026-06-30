import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query
  const key = process.env.INDEXNOW_KEY

  if (!key) {
    return res.status(404).end()
  }

  // The request could be /foo.txt, so path might be 'foo'
  const requestedKey = Array.isArray(path) ? path[0] : path

  if (requestedKey === key) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8')
    res.status(200).send(key)
    return
  }

  // Also check if the raw URL ends with the key.txt just in case rewrites act weird
  if (req.url && req.url.includes(`${key}.txt`)) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8')
    res.status(200).send(key)
    return
  }

  res.status(404).end()
}
