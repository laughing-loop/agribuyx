import type { GetServerSideProps } from 'next'

// / permanently redirects to /products
// Using permanent: true (308) so Google consolidates link equity to /products
// and does not treat / and /products as duplicate pages.
export default function HomeRedirect() {
  return null
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/products',
      permanent: true, // 308 — tells Google: / IS /products, always
    },
  }
}
