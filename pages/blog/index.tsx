import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/products" className="flex items-center gap-2">
            <Image
              src="/agribuyx_logo-02.svg"
              alt="AgriBuyX"
              width={140}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/products" className="text-gray-700 hover:text-green-700 font-medium">
              Shop
            </Link>
            <Link href="/admin/login" className="text-green-600 hover:text-green-700 font-semibold">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Updates for Farmers</h1>
          <p className="text-sm text-gray-600">
            Practical tips, market updates, and platform news.
          </p>
        </header>

        {loading ? (
          <div className="py-12 text-center text-gray-600">Loading updates...</div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-gray-600 bg-white rounded-lg shadow">
            No updates have been published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="cursor-pointer overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-2">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.summary}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white text-center py-8 mt-20">
        <p>&copy; 2025 AgriBuyX. All rights reserved. | agribuyx.com</p>
      </footer>
    </div>
  )
}
