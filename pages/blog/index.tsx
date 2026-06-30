/**
 * Blog Index Page — pages/blog/index.tsx
 *
 * Changes from original:
 *  - Added getServerSideProps (SSR — enables Google to index the blog listing)
 *  - Added <SEO> with blog listing title, description, canonical
 *  - Updated nav/footer to match marketplace style
 *  - Existing featured/recent layout preserved
 */

import Link from 'next/link'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getThumbnailUrl } from '@/lib/cloudinary'
import MarketplaceFooter from '@/components/MarketplaceFooter'
import SEO from '@/components/SEO'
import JsonLd from '@/components/JsonLd'
import { blogListingSeoTitle, blogListingSeoDescription, canonicalUrl } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/schema'

interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  image_url?: string | null
  created_at: string
}

interface Props {
  posts: BlogPost[]
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabaseServer
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  return {
    props: {
      posts: (!error && data ? data : []) as BlogPost[],
    },
  }
}

export default function BlogIndex({ posts }: Props) {
  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)

  const breadcrumbItems = [
    { name: 'Home', url: canonicalUrl('/') },
    { name: 'Blog', url: canonicalUrl('/blog') },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title={blogListingSeoTitle}
        description={blogListingSeoDescription}
        canonical={canonicalUrl('/blog')}
      />
      <JsonLd schema={breadcrumbSchema(breadcrumbItems)} id="breadcrumb-schema" />

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/products" className="flex items-center gap-2 transition-transform hover:scale-105" aria-label="AgriBuyX marketplace">
            <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium" aria-label="Site links">
            <Link href="/products" className="text-slate-700 hover:text-emerald-700 transition-colors">Shop</Link>
            <Link href="/blog" className="text-emerald-700 font-semibold" aria-current="page">Blog</Link>
          </nav>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs text-emerald-200">
              <li><Link href="/products" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white" aria-current="page">Blog</li>
            </ol>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">Insights for Farmers</h1>
            <p className="text-lg sm:text-xl text-emerald-100 leading-relaxed">
              Practical tips, market updates, and the latest news to help you grow your agricultural business.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
            <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No articles yet</h2>
            <p className="mt-2 text-slate-600">Check back soon for farming tips and updates.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="block mb-14 group">
                <article className="relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-full overflow-hidden">
                      {featuredPost.image_url ? (
                        <img
                          src={getThumbnailUrl(featuredPost.image_url, 800, 600)}
                          alt={`Featured: ${featuredPost.title}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-lg">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <time dateTime={featuredPost.created_at} className="text-sm font-medium text-emerald-700 mb-3">
                        {new Date(featuredPost.created_at).toLocaleDateString('en-GH', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </time>
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-emerald-700 transition-colors">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.summary && (
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed line-clamp-3">{featuredPost.summary}</p>
                      )}
                      <div className="flex items-center text-emerald-700 font-semibold">
                        Read article
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Recent Posts Grid */}
            {recentPosts.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Recent Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                      <article className="h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
                        <div className="relative h-48 overflow-hidden bg-slate-100">
                          {post.image_url ? (
                            <img
                              src={getThumbnailUrl(post.image_url, 600, 400)}
                              alt={`${post.title} — AgriBuyX Blog`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                          )}
                        </div>
                        <div className="p-5">
                          <time dateTime={post.created_at} className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                            {new Date(post.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </time>
                          <h3 className="mt-2 text-lg font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                            {post.title}
                          </h3>
                          {post.summary && (
                            <p className="mt-2 text-slate-600 text-sm leading-relaxed line-clamp-3">{post.summary}</p>
                          )}
                          <div className="mt-4 flex items-center text-emerald-700 text-sm font-semibold">
                            Read more
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <MarketplaceFooter />
    </div>
  )
}
