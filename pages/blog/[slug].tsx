/**
 * Blog Post Detail Page — pages/blog/[slug].tsx
 *
 * Changes from original:
 *  - Added getServerSideProps (SSR — critical for Google indexing blog content)
 *  - Added <SEO> with article title, description, OG image, canonical
 *  - Added <JsonLd> with Article schema
 *  - Calculated real reading time from content
 *  - Standardised nav/footer to match marketplace (MarketplaceFooter)
 *  - Removed decorative newsletter widget (was non-functional)
 *  - Added breadcrumb nav
 *  - All ReactMarkdown content rendering preserved
 */

import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { GetServerSideProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import MarketplaceFooter from '@/components/MarketplaceFooter'
import SEO from '@/components/SEO'
import JsonLd from '@/components/JsonLd'
import { blogSeoTitle, blogSeoDescription, canonicalUrl, readingTime } from '@/lib/seo'
import { articleSchema, breadcrumbSchema } from '@/lib/schema'
import { getThumbnailUrl } from '@/lib/cloudinary'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  image_url?: string | null
  video_url?: string | null
  created_at: string
  updated_at?: string | null
}

interface Props {
  post: BlogPost | null
}

// ─── SSR ──────────────────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { slug } = context.params || {}

  if (!slug || typeof slug !== 'string') {
    return { notFound: true }
  }

  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabaseServer
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return { notFound: true }
  }

  return { props: { post: data as BlogPost } }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogPostPage({ post }: Props) {
  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[60vh] flex-col px-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Article not found</h1>
          <p className="text-slate-600 mb-6">The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/blog" className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
            Browse all articles
          </Link>
        </div>
      </div>
    )
  }

  // ── SEO values ────────────────────────────────────────────────────────────
  const seoTitle = blogSeoTitle({ title: post.title, summary: post.summary })
  const seoDescription = blogSeoDescription({ title: post.title, summary: post.summary })
  const canonical = canonicalUrl(`/blog/${post.slug}`)
  const timeToRead = readingTime(post.content || post.summary || post.title)

  // ── Schema ────────────────────────────────────────────────────────────────
  const articleSchemaData = articleSchema({
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    content: post.content,
    image_url: post.image_url,
    created_at: post.created_at,
    updated_at: post.updated_at,
  })

  const breadcrumbItems = [
    { name: 'Home', url: canonicalUrl('/') },
    { name: 'Blog', url: canonicalUrl('/blog') },
    { name: post.title, url: canonical },
  ]

  // ── Video renderer ────────────────────────────────────────────────────────
  const renderVideo = () => {
    if (!post.video_url) return null
    const url = post.video_url
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
      return (
        <div className="my-8 aspect-video w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
          <iframe
            src={embedUrl}
            title={`Video: ${post.title}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    if (url.endsWith('.mp4') || url.endsWith('.webm')) {
      return (
        <div className="my-8 w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
          <video src={url} controls className="w-full" />
        </div>
      )
    }
    return null
  }

  // ── Share handlers (client-side only) ─────────────────────────────────────
  const getShareUrl = () => (typeof window !== 'undefined' ? window.location.href : canonical)

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(getShareUrl())}`, '_blank')
  }
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank')
  }
  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${post.title} ${getShareUrl()}`)}`, '_blank')
  }
  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(getShareUrl())
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        ogImage={post.image_url}
        ogType="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at || undefined}
      />
      <JsonLd schema={articleSchemaData} id="article-schema" />
      <JsonLd schema={breadcrumbSchema(breadcrumbItems)} id="breadcrumb-schema" />

      {/* Skip to content */}
      <a href="#article-content" className="skip-to-content">Skip to article</a>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200" aria-label="Main navigation">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-4 py-3 gap-y-3">
          <Link href="/" aria-label="AgriBuyX — back to marketplace">
            <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3 md:gap-5 text-sm font-medium text-slate-700 overflow-x-auto">
            <Link href="/products" className="hover:text-emerald-700 whitespace-nowrap">Marketplace</Link>
            <Link href="/categories/farm-machinery-equipment" className="hover:text-emerald-700 whitespace-nowrap hidden sm:inline-block">Machinery</Link>
            <Link href="/categories/seeds" className="hover:text-emerald-700 whitespace-nowrap hidden sm:inline-block">Seeds</Link>
            <Link href="/categories/fertilizers" className="hover:text-emerald-700 whitespace-nowrap hidden md:inline-block">Fertilizers</Link>
            <Link href="/blog" className="text-emerald-700 whitespace-nowrap">Blog</Link>
            <Link href="/admin/login" className="hover:text-emerald-700 whitespace-nowrap">Vendor</Link>
          </div>
        </div>
      </nav>

      <main id="article-content" className="pb-16">
        {/* Hero image */}
        <div className="relative w-full h-[50vh] min-h-[360px] mb-12">
          {post.image_url ? (
            <div className="absolute inset-0">
              <img
                src={getThumbnailUrl(post.image_url, 1200, 800)}
                alt={`Cover image for: ${post.title}`}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" aria-hidden="true" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-900" />
          )}

          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-3">
                <ol className="flex items-center gap-2 text-xs text-white/70">
                  <li><Link href="/" className="hover:text-white">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white/90 truncate max-w-[14rem]" aria-current="page">{post.title}</li>
                </ol>
              </nav>

              <span className="inline-block px-3 py-1 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-100 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Article
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-slate-300 text-sm">
                <time dateTime={post.created_at} className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(post.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {timeToRead}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-10">

            {/* Main article */}
            <article className="flex-1 min-w-0">
              {post.summary && (
                <p className="text-xl text-slate-600 mb-8 font-serif italic leading-relaxed pl-5 border-l-4 border-emerald-500">
                  {post.summary}
                </p>
              )}

              {post.content && (
                <div className="prose prose-lg prose-emerald max-w-none
                  prose-headings:text-slate-900 prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-slate-700 prose-p:leading-relaxed
                  prose-li:text-slate-700
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-emerald-500 prose-blockquote:text-slate-600
                  prose-code:text-emerald-700 prose-code:bg-emerald-50 prose-code:rounded prose-code:px-1">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm as any]}
                    components={{
                      a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              )}

              {renderVideo()}

              {/* Share section */}
              <div className="mt-12 pt-8 border-t border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Share this article</h2>
                <div className="flex gap-3">
                  <button
                    onClick={shareOnFacebook}
                    className="p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    onClick={shareOnTwitter}
                    className="p-2.5 rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"
                    aria-label="Share on Twitter / X"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </button>
                  <button
                    onClick={shareOnWhatsApp}
                    className="p-2.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    aria-label="Share on WhatsApp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </button>
                  <button
                    onClick={copyLink}
                    className="p-2.5 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Copy article link"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* CTA back to marketplace */}
              <div className="mt-10 rounded-xl bg-emerald-50 border border-emerald-200 p-5">
                <p className="text-sm font-semibold text-emerald-900">Looking for agricultural products?</p>
                <p className="mt-1 text-sm text-emerald-800">Browse seeds, fertilizers, pesticides, and farm equipment from trusted vendors in Ghana.</p>
                <Link
                  href="/products"
                  className="mt-3 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Browse marketplace →
                </Link>
              </div>
            </article>

            {/* Sticky sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-xl bg-slate-50 p-5 border border-slate-200">
                  <h2 className="font-bold text-slate-900 mb-2 text-sm">About AgriBuyX</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Ghana&apos;s agricultural marketplace. Find farm inputs, equipment, and crop protection products from verified sellers.
                  </p>
                  <Link href="/products" className="block w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-lg text-sm font-semibold transition">
                    Shop Products
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <MarketplaceFooter />
    </div>
  )
}
