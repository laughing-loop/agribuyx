import Link from 'next/link'
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">AgriBuyX</h1>
          <Link href="/admin/login" className="text-green-600 hover:text-green-700 font-semibold">
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          The Future of Agricultural Commerce
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Connecting farmers, vendors, and buyers on one platform
        </p>

        {/* Coming Soon Banner */}
        <div className="bg-blue-600 text-white rounded-lg py-12 px-8 mb-12">
          <div className="inline-block">
            <span className="inline-block bg-blue-700 rounded-full px-4 py-1 text-sm font-semibold mb-4">
              COMING SOON
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-4">We're Launching Soon!</h3>
          <p className="text-lg text-blue-100 mb-8">
            AgriBuyX is under construction. Be the first to know when we launch.
          </p>

          {/* Email Signup */}
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded text-gray-900"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-semibold transition"
            >
              Notify Me
            </button>
          </form>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">🌾</div>
            <h4 className="text-xl font-semibold mb-2">For Farmers</h4>
            <p className="text-gray-600">Direct market access without middlemen</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">🏪</div>
            <h4 className="text-xl font-semibold mb-2">For Vendors</h4>
            <p className="text-gray-600">Grow your agricultural business online</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">🛒</div>
            <h4 className="text-xl font-semibold mb-2">For Buyers</h4>
            <p className="text-gray-600">Fresh products at fair prices</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-20">
        <p>&copy; 2025 AgriBuyX. All rights reserved. | agribuyx.com</p>
      </footer>
    </div>
  );
}
