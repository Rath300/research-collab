import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">ResearchCollab</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 w-full max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Collaborate on Research with Ease
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Connect with researchers in your field, share ideas, and publish groundbreaking work together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white text-center font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
        <div className="flex-1 relative h-[400px] w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-80 blur-xl"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 w-[90%] h-[90%] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 p-2">
                <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-4">
                  <div className="w-full h-4 bg-blue-200 dark:bg-blue-700 rounded mb-2"></div>
                  <div className="w-2/3 h-4 bg-blue-200 dark:bg-blue-700 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-2/3 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-4">
                  <div className="w-full h-4 bg-purple-200 dark:bg-purple-700 rounded mb-2"></div>
                  <div className="w-2/3 h-4 bg-purple-200 dark:bg-purple-700 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature section */}
      <section className="w-full max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Find Collaborators</h3>
          <p className="text-gray-600 dark:text-gray-300">Connect with researchers who share your interests and complement your skills.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Communicate</h3>
          <p className="text-gray-600 dark:text-gray-300">Exchange ideas, discuss methodologies, and plan projects with real-time messaging.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Publish Together</h3>
          <p className="text-gray-600 dark:text-gray-300">Share research findings, co-author papers, and get feedback from the community.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400">© 2023 ResearchCollab. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Terms</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Privacy</Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
