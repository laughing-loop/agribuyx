import Link from 'next/link'
import Image from 'next/image'

type SocialLinks = {
  whatsapp_channel_url?: string
  tiktok_url?: string
  facebook_url?: string
}

export default function MarketplaceFooter({
  socialLinks = {},
  onSupportClick,
}: {
  socialLinks?: SocialLinks
  onSupportClick?: () => void
}) {
  const hasSocialLinks =
    Boolean(socialLinks.whatsapp_channel_url) ||
    Boolean(socialLinks.tiktok_url) ||
    Boolean(socialLinks.facebook_url)

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-12 md:py-10">
        <div className="md:col-span-4">
          <Link href="/products" className="inline-flex items-center">
            <Image
              src="/agribuyx_logo-02.svg"
              alt="AgriBuyX"
              width={150}
              height={36}
              className="h-9 w-auto"
            />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            A marketplace for farm inputs, equipment, and agricultural products from trusted sellers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:col-span-6 sm:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Marketplace</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/products" className="text-slate-700 hover:text-emerald-700">All Products</Link>
              <Link href="/categories/farm-machinery-equipment" className="text-slate-700 hover:text-emerald-700">Farm Machinery</Link>
              <Link href="/categories/seeds" className="text-slate-700 hover:text-emerald-700">Seeds</Link>
              <Link href="/categories/fertilizers" className="text-slate-700 hover:text-emerald-700">Fertilizers</Link>
              <Link href="/categories/crop-protection" className="text-slate-700 hover:text-emerald-700">Crop Protection</Link>
              <Link href="/categories/livestock-supplies" className="text-slate-700 hover:text-emerald-700">Livestock Supplies</Link>
              <Link href="/categories/irrigation-watering" className="text-slate-700 hover:text-emerald-700">Irrigation</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/" className="text-slate-700 hover:text-emerald-700">About AgriBuyX</Link>
              <Link href="/blog" className="text-slate-700 hover:text-emerald-700">Blog & Tips</Link>
              {onSupportClick ? (
                <button type="button" onClick={onSupportClick} className="text-left text-slate-700 hover:text-emerald-700">
                  Contact Support
                </button>
              ) : (
                <a href="mailto:support@agribuyx.com" className="text-slate-700 hover:text-emerald-700">
                  Contact Support
                </a>
              )}
              {hasSocialLinks && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {socialLinks.whatsapp_channel_url && <a href={socialLinks.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-700 hover:text-emerald-700">WhatsApp</a>}
                  {socialLinks.tiktok_url && <a href={socialLinks.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-700 hover:text-emerald-700">TikTok</a>}
                  {socialLinks.facebook_url && <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-700 hover:text-emerald-700">Facebook</a>}
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/admin/login" className="text-slate-700 hover:text-emerald-700">Vendor Office</Link>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Buyer reminder</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Confirm price, quantity, location, and seller details before payment or pickup.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 AgriBuyX. All rights reserved.</p>
          <p>agribuyx.com</p>
        </div>
      </div>
    </footer>
  )
}
