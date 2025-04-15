import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
      <div className="space-y-6 max-w-md">
        <div className="relative">
          <div className="text-9xl font-extrabold text-gray-100 dark:text-gray-800">404</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">Oops!</h1>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Page not found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" passHref>
              <Button>
                Return Home
              </Button>
            </Link>
            
            <Link href="/research" passHref>
              <Button variant="outline">
                Browse Research
              </Button>
            </Link>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-3">Looking for one of these?</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/login" className="text-primary-600 hover:underline dark:text-primary-400 px-3 py-1">Login</Link>
              <Link href="/signup" className="text-primary-600 hover:underline dark:text-primary-400 px-3 py-1">Sign up</Link>
              <Link href="/dashboard" className="text-primary-600 hover:underline dark:text-primary-400 px-3 py-1">Dashboard</Link>
              <Link href="/profile" className="text-primary-600 hover:underline dark:text-primary-400 px-3 py-1">Profile</Link>
              <Link href="/collaborators" className="text-primary-600 hover:underline dark:text-primary-400 px-3 py-1">Find Collaborators</Link>
              <Link href="/settings" className="text-primary-600 hover:underline dark:text-primary-400 px-3 py-1">Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 