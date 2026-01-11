import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'
import { getThumbnailUrl } from '@/lib/cloudinary'

interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  image_url?: string | null
  video_url?: string | null
  created_at: string
}

export default function BlogPostPage() {
  const router = useRouter()
  const { slug } = router.query

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!error && data) {
        setPost(data as BlogPost)
      }
      setLoading(false)
    }

    fetchPost()
  }, [slug])

  const renderVideo = () => {
    if (!post || !post.video_url) return null

    const url = post.video_url

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url
        .replace('watch?v=', 'embed/')
        .replace('youtu.be/', 'www.youtube.com/embed/')

      return (
        <div className="my-8 aspect-video w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
          <iframe
            src={embedUrl}
            title={post.title}
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

  // Share handlers
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = post?.title || ''

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/products" className="flex items-center gap-2">
              <Image src="/agribuyx_logo-02.svg" alt="AgriBuyX" width={140} height={32} className="h-8 w-auto" />
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[60vh] flex-col px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition">
            Browse all articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link href="/blog" className="flex items-center text-gray-500 hover:text-green-600 transition-colors font-medium">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>
          <Link href="/products" className="flex items-center gap-2">
            <Image
              src="/agribuyx_logo-02.svg"
              alt="AgriBuyX"
              width={120}
              height={28}
              className="h-7 w-auto"
            />
          </Link>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>
      </nav>

      <main className="pb-20">
        {/* Full-width Hero Image with Overlay */}
        <div className="relative w-full h-[50vh] min-h-[400px] mb-12">
          {post.image_url ? (
            <div className="absolute inset-0">
              <img
                src={getThumbnailUrl(post.image_url, 1200, 800)}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-900"></div>
          )}

          <div className="absolute bottom-0 left-0 w-full">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
              <span className="inline-block px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-50 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Article
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center text-gray-300 text-sm">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="mx-3">•</span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  5 min read
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Main Content */}
            <article className="flex-1">
              {post.summary && (
                <p className="text-xl text-gray-600 mb-8 font-serif italic leading-relaxed pl-6 border-l-4 border-green-500">
                  {post.summary}
                </p>
              )}

              {post.content && (
                <div className="prose prose-lg prose-green max-w-none 
                  prose-headings:text-gray-900 prose-headings:font-bold 
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 
                  prose-p:text-gray-700 prose-p:leading-relaxed 
                  prose-li:text-gray-700
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm as any]}
                    components={{
                      a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              )}

              {renderVideo()}

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Share this article</h3>
                <div className="flex gap-4">
                  <button onClick={shareOnFacebook} className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" aria-label="Share on Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </button>
                  <button onClick={shareOnTwitter} className="p-2 rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors" aria-label="Share on Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                  </button>
                  <button onClick={shareOnWhatsApp} className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors" aria-label="Share on WhatsApp">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl) }} className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Copy Link">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              </div>
            </article>

            {/* Sticky Sidebar */}
            <aside className="hidden md:block w-72 shrink-0">
              <div className="sticky top-28 space-y-8">
                {/* About AgribuyX */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2">About AgriBuyX</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your trusted platform for agricultural products and tips. Join our community of farmers.
                  </p>
                  <Link href="/products" className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-center rounded-lg text-sm font-medium transition-colors">
                    Shop Products
                  </Link>
                </div>

                {/* Newsletter (Visual Only) */}
                <div className="bg-green-900 rounded-xl p-6 text-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light">
                  <h3 className="font-bold mb-2">Stay Updated</h3>
                  <p className="text-xs text-green-100 mb-4">
                    Get the latest farming tips directly to your inbox.
                  </p>
                  <div className="space-y-2">
                    <input type="email" placeholder="Your email address" className="w-full px-3 py-2 rounded-lg bg-green-800 border border-green-700 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                    <button className="w-full py-2 px-4 bg-white text-green-900 hover:bg-green-50 text-center rounded-lg text-sm font-medium transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8">
        <p>&copy; 2025 AgriBuyX. All rights reserved. | agribuyx.com</p>
      </footer>
    </div>
  )
}
