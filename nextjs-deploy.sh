#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Create temporary directory for deployment
echo "Creating deployment directory..."
rm -rf nextjs-deploy
mkdir -p nextjs-deploy
cd nextjs-deploy

# Initialize a new Next.js project
echo "Initializing a new Next.js project..."
npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm

# Remove placeholder pages
rm -rf src/app/*
mkdir -p src/app/{research,collaborators,login,signup,dashboard}

# Create basic layout
echo "Creating basic layout..."
cat > src/app/layout.tsx << EOF
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchCollab - Connecting Researchers and Ideas",
  description: "A platform for researchers to collaborate and share ideas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
EOF

# Create home page
echo "Creating home page..."
cat > src/app/page.tsx << EOF
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">ResearchCollab</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Connect with Researchers Worldwide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find collaborators, share your research, join project guilds, and get recognized for your contributions.
          </p>
          <div className="mt-10">
            <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700">
              Join for Free
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Discover Research</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Browse through a feed of research posts from academics worldwide.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Find Collaborators</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with potential research partners that share your interests.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Track Contributions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get recognized for your research contributions with our verification system.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Ready to advance your research?
          </h2>
          <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700">
            Get Started Today
          </Link>
        </div>
      </main>
    </div>
  );
}
EOF

# Create dashboard page
echo "Creating dashboard page..."
cat > src/app/dashboard/page.tsx << EOF
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
EOF

# Create simplified research page
echo "Creating research page..."
cat > src/app/research/page.tsx << EOF
export default function ResearchPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Research Feed</h1>
      
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Example Research Post {i + 1}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This is a placeholder for a research post. In the actual app, this would display real content.
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-4">Posted by: Researcher #{i + 1}</span>
              <span>Tags: Research, Science, Technology</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

# Create simple login page
echo "Creating login page..."
cat > src/app/login/page.tsx << EOF
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">ResearchCollab</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log in to your account</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter your email and password to access your account
            </p>
          </div>
          
          <form>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="text-right">
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Forgot password?
                </a>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log in
              </button>
              
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue as Guest
              </button>
              
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
EOF

# Create simple signup page
echo "Creating signup page..."
cat > src/app/signup/page.tsx << EOF
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">ResearchCollab</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Join ResearchCollab to connect with researchers worldwide
            </p>
          </div>
          
          <form>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign up
              </button>
              
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Log in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
EOF

# Create collaborators page
echo "Creating collaborators page..."
cat > src/app/collaborators/page.tsx << EOF
export default function CollaboratorsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find Collaborators</h1>
      
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Researcher #{i + 1}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {["Professor", "PhD Student", "Research Scientist", "Postdoctoral Fellow", "Principal Investigator"][i]} 
                at {["Stanford University", "MIT", "Oxford University", "Harvard University", "UC Berkeley"][i]}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Interests: 
                {[
                  " Machine Learning, Data Science, Natural Language Processing",
                  " Climate Science, Renewable Energy, Sustainability",
                  " Genetics, Molecular Biology, Bioinformatics",
                  " Quantum Computing, Theoretical Physics, Algorithms",
                  " Neuroscience, Brain Imaging, Cognitive Psychology"
                ][i]}
              </p>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

# Create vercel.json
echo "Creating Vercel configuration..."
cat > vercel.json << EOF
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
EOF

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel deploy --prod --yes

echo "Deployment completed successfully!" 