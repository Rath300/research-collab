import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiUsers, FiBarChart2 } from "react-icons/fi";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-white/70 dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full gradient-purple-blue flex items-center justify-center">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <span className="text-2xl font-bold font-heading text-gray-900 dark:text-white">ResearchCollab</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:from-blue-700 hover:to-purple-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="gradient-text mb-6">
                Elevate Your Academic Research
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0">
                Connect with researchers worldwide, collaborate on groundbreaking projects, and accelerate the pace of scientific discovery.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/signup" 
                  className="btn btn-primary px-8 py-3 text-base rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Join the Community
                </Link>
                <Link 
                  href="/about" 
                  className="btn btn-outline px-8 py-3 text-base rounded-md group"
                >
                  Learn More
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-20 blur-2xl"></div>
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="aspect-video">
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-900 grid place-items-center p-6">
                    <div className="text-center space-y-4">
                      <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-4 mx-auto">
                        <FiUsers className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">Collaborate Seamlessly</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Find researchers with complementary skills and interests to drive your projects forward.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose ResearchCollab?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform is designed to solve the unique challenges of academic collaboration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card card-hover">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Ideal Collaborators</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our matching algorithm connects you with researchers who complement your expertise and share your research interests.
              </p>
            </div>
            
            <div className="card card-hover">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <FiBookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Research Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Publish your findings, get feedback from peers, and discover cutting-edge research in your field.
              </p>
            </div>
            
            <div className="card card-hover">
              <div className="rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <FiBarChart2 className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Contributions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get recognized for your research contributions with our verification system and build your academic reputation.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to advance your research?</h2>
              <p className="text-xl opacity-90 mb-8">
                Join thousands of researchers who are already collaborating on breakthrough projects.
              </p>
              <Link 
                href="/signup" 
                className="inline-block px-8 py-3 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto py-12 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full gradient-purple-blue flex items-center justify-center">
                <span className="text-sm font-bold text-white">R</span>
              </div>
              <span className="text-xl font-bold font-heading text-gray-900 dark:text-white">ResearchCollab</span>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                About
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Terms
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} ResearchCollab. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
