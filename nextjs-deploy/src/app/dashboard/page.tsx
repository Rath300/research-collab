import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Research Feed</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Check out the latest research posts from the community.
          </p>
          <Link href="/research" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Browse Research &rarr;
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Find Collaborators</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Connect with researchers who match your interests.
          </p>
          <Link href="/collaborators" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Discover Collaborators &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
