import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getThumbnailUrl } from '@/lib/cloudinary'

interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  image_url?: string | null
  created_at: string
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPosts(data as BlogPost[])
      }
      setLoading(false)
    }

    fetchPosts()
  }, [])

  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/products" className="flex items-center gap-2 transition-transform hover:scale-105">
            <Image
              src="/agribuyx_logo-02.svg"
              alt="AgriBuyX"
              width={140}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/products" className="text-gray-700 hover:text-green-600 transition-colors">
              Shop
            </Link>
            <Link href="/blog" className="text-green-600 font-semibold">
              Blog
            </Link>
            <Link href="/admin/login" className="text-gray-700 hover:text-green-600 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Insights for Farmers
            </h1>
            <p className="text-lg sm:text-xl text-green-50 leading-relaxed">
              Practical tips, market updates, and the latest news to help you grow your agricultural business.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No articles yet</h3>
            <p className="mt-2 text-gray-600">Check back soon for farming tips and updates.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="block mb-16 group">
                <article className="relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 md:h-full overflow-hidden">
                      {featuredPost.image_url ? (
                        <img
                          src={getThumbnailUrl(featuredPost.image_url, 800, 600)}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white shadow-lg">
                          Featured
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <time className="text-sm font-medium text-green-600 mb-3">
                        {new Date(featuredPost.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-green-600 transition-colors">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.summary && (
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed line-clamp-3">
                          {featuredPost.summary}
                        </p>
                      )}
                      <div className="flex items-center text-green-600 font-semibold group-hover:gap-3 transition-all">
                        Read article
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                      <article className="h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          {post.image_url ? (
                            <img
                              src={getThumbnailUrl(post.image_url, 600, 400)}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <time className="text-xs font-medium text-green-600 uppercase tracking-wide">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                          <h3 className="mt-3 text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-green-600 transition-colors">
                            {post.title}
                          </h3>
                          {post.summary && (
                            <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-3">
                              {post.summary}
                            </p>
                          )}
                          <div className="mt-4 flex items-center text-green-600 text-sm font-semibold">
                            Read more
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-400">&copy; 2025 AgriBuyX. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2">agribuyx.com</p>
        </div>
      </footer>
    </div>
  )
}
