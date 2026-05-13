import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AdminAuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-12">
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:col-span-7 lg:px-8">
          <div className="w-full max-w-md">
            <Link href="/products" className="mb-8 inline-flex items-center">
              <Image
                src="/agribuyx_logo-02.svg"
                alt="AgriBuyX"
                width={170}
                height={44}
                className="h-11 w-auto"
                priority
              />
            </Link>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {eyebrow}
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </section>

        <aside className="hidden border-l border-slate-200 bg-white lg:col-span-5 lg:block">
          <div className="flex h-full flex-col justify-between p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Merchant Portal
              </p>
              <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight text-slate-950">
                Manage products, updates, vendors, and support in one place.
              </h2>
              <div className="mt-8 grid gap-3">
                {[
                  'Create and edit marketplace listings',
                  'Invite vendors and manage access',
                  'Publish updates and social links',
                  'Track buyer support requests',
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">Access is invite-only.</p>
              <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                Vendors receive an email link, set a password, then continue into the dashboard.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
