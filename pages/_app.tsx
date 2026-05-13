import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Component, type ReactNode } from 'react'

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('Application error:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">
          <div className="mx-auto max-w-xl rounded-lg border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
              Application error
            </p>
            <h1 className="mt-2 text-xl font-semibold text-gray-900">
              Something went wrong on this page.
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Refresh the page and try again. If it happens after saving a product, check the product fields and image upload setup.
            </p>
            {process.env.NODE_ENV !== 'production' && (
              <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-white">
                {this.state.error?.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Reload page
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppErrorBoundary>
      <Component {...pageProps} />
    </AppErrorBoundary>
  )
}
