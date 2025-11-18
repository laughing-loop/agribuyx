import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'

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
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg">
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
        <div className="mt-6 w-full overflow-hidden rounded-lg">
          <video src={url} controls className="w-full" />
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading post...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/products" className="flex items-center gap-2">
              <Image
                src="/agribuyx_logo-02.svg"
                alt="AgriBuyX"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-green-700 font-medium text-sm">
              Shop
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Post not found</p>
            <Link href="/blog" className="text-green-600 hover:text-green-700 font-semibold">
              ← Back to all updates
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
            <Link href="/blog" className="text-gray-700 hover:text-green-700 font-medium">
              Updates
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/blog" className="text-green-600 hover:text-green-700 font-semibold text-sm inline-block mb-4">
          ← Back to all updates
        </Link>

        {post.image_url && (
          <div className="mb-6 overflow-hidden rounded-lg">
            <img
              src={post.image_url}
              alt={post.title}
              className="h-56 w-full object-cover"
            />
          </div>
        )}

        <p className="text-xs text-gray-500 mb-1">
          {new Date(post.created_at).toLocaleDateString()}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
        {post.summary && (
          <p className="text-sm text-gray-600 mb-4">{post.summary}</p>
        )}

        {post.content && (
          <div className="prose prose-sm md:prose-base max-w-none text-gray-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm as any]}
              components={{
                a: (props) => (
                  <a {...props} target="_blank" rel="noreferrer" />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        )}

        {renderVideo()}
      </div>

      <footer className="bg-gray-900 text-white text-center py-8 mt-20">
        <p>&copy; 2025 AgriBuyX. All rights reserved. | agribuyx.com</p>
      </footer>
    </div>
  )
}
