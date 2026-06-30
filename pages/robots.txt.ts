import type { GetServerSideProps } from 'next'

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://agribuyx.com').replace(/\/$/, '')

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${BASE_URL}/sitemap.xml`,
    '',
  ].join('\n')

  res.setHeader('Content-Type', 'text/plain; charset=UTF-8')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400')
  res.statusCode = 200
  res.end(robots)

  return { props: {} }
}

export default function RobotsPage() {
  return null
}
