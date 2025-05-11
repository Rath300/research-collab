import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">🐝</span>
              </div>
              <span className="text-lg font-bold">Research Bee</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connecting researchers worldwide.
            </p>
          </div>
          <nav className="flex flex-col space-y-2 text-sm">
            <p className="font-medium">Platform</p>
            <Link href="/research" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Research Feed
            </Link>
            <Link href="/collaborators" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Find Collaborators
            </Link>
            <Link href="/projects" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Project Hub
            </Link>
          </nav>
          <nav className="flex flex-col space-y-2 text-sm">
            <p className="font-medium">Resources</p>
            <Link href="/help" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Help Center
            </Link>
            <Link href="/blog" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Contact
            </Link>
          </nav>
          <nav className="flex flex-col space-y-2 text-sm">
            <p className="font-medium">Legal</p>
            <Link href="/privacy" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              Terms
            </Link>
          </nav>
        </div>
        <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Research Bee. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 