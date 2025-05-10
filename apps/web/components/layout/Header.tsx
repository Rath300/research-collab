import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';

export function Header() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <header className="w-full py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">🐝</span>
            </div>
            <span className="text-xl font-bold">Research Bee</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/research" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Research Feed
            </Link>
            <Link href="/collaborators" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Find Collaborators
            </Link>
            <Link href="/projects" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Project Hub
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button onClick={() => router.push('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push('/profile')}>
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push('/login')}>
                  Log In
                </Button>
                <Button onClick={() => router.push('/signup')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 