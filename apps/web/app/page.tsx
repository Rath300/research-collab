import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiArrowRight, FiUsers, FiTarget, FiClock, FiSearch, FiBook } from 'react-icons/fi';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-700 dark:bg-slate-900/90">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">#</span>
            </div>
            <span className="text-xl font-bold">ResearchCollab</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Pricing
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hidden md:block text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Log in
            </Link>
            <Link href="/signup" passHref>
              <Button size="sm">Sign up free</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Accelerate Research Through Collaboration
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Connect with like-minded researchers, share ideas, find collaborators, and transform your research journey.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup" passHref>
                  <Button size="lg" className="px-8">
                    Get Started
                    <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link href="#how-it-works" passHref>
                  <Button size="lg" variant="outline" className="px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl opacity-20 blur-2xl">
                </div>
                <div className="relative z-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
                  <div className="aspect-[16/9]">
                    {/* In real implementation, replace with actual app screenshot */}
                    <div className="grid h-full place-items-center bg-gray-100 dark:bg-gray-900">
                      <div className="flex flex-col items-center space-y-2 p-8 text-center">
                        <div className="rounded-full bg-primary-600 p-3 text-white">
                          <FiUsers size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold">Find Your Research Match</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Discover collaborators based on interests and expertise.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Features That Empower Your Research
            </h2>
            <p className="max-w-[85%] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Everything you need to collaborate, innovate, and accelerate your research journey.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow dark:border-gray-800 dark:bg-slate-800">
                <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900">
                  <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Transform Your Research?
              </h2>
              <p className="max-w-[85%] mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join thousands of researchers who are already collaborating and advancing their work.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <Link href="/signup" passHref>
                <Button size="lg" className="w-full">
                  Sign Up Free
                  <FiArrowRight className="ml-2" />
                </Button>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No credit card required. Free accounts include core features.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">#</span>
                </div>
                <span className="text-lg font-bold">ResearchCollab</span>
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
              <Link href="/guilds" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                Project Guilds
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
              <Link href="/events" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                Research Events
              </Link>
            </nav>
            <nav className="flex flex-col space-y-2 text-sm">
              <p className="font-medium">Company</p>
              <Link href="/about" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                About Us
              </Link>
              <Link href="/careers" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                Careers
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                Contact
              </Link>
            </nav>
            <nav className="flex flex-col space-y-2 text-sm">
              <p className="font-medium">Legal</p>
              <Link href="/privacy" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                Cookie Policy
              </Link>
            </nav>
          </div>
          <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} ResearchCollab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature list for the features section
const features = [
  {
    title: "Find Collaborators",
    description: "Discover the perfect research partners based on interests, expertise, and availability.",
    icon: FiUsers,
  },
  {
    title: "Research Feed",
    description: "Browse trending research and papers from the community, filtered to your interests.",
    icon: FiSearch,
  },
  {
    title: "Project Guilds",
    description: "Join specialized research communities to collaborate on shared objectives.",
    icon: FiTarget,
  },
  {
    title: "Timestamped Ideas",
    description: "Securely record and verify ownership of your research ideas and contributions.",
    icon: FiClock,
  },
  {
    title: "AI Paper Reviews",
    description: "Get instant feedback and improvement suggestions on your research papers.",
    icon: FiBook,
  },
  {
    title: "Mentor Matching",
    description: "Connect with experienced mentors who can guide your research journey.",
    icon: FiUsers,
  },
];
