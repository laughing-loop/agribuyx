import type { GetServerSideProps } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agribuyx.com'

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robots = `# AgriBuyX robots.txt
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`

  res.setHeader('Content-Type', 'text/plain; charset=UTF-8')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400')
  res.write(robots)
  res.end()

  return { props: {} }
}

export default function RobotsPage() {
  return null
}
