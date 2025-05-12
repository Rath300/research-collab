"use client";

import Link from 'next/link';
import { FiSearch, FiUsers, FiMessageSquare, FiTarget } from 'react-icons/fi';

// Helper component for Feature Cards
const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="mb-4">
      <Icon className="h-8 w-8 text-ic-yellow-accent" />
    </div>
    <h3 className="text-xl font-semibold text-ic-text-primary mb-2">{title}</h3>
    <p className="text-ic-text-secondary leading-relaxed">{description}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-ic-text-primary flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-ic-border/30">
        <Link href="/" className="text-3xl font-bold text-ic-yellow-accent tracking-tight">
          RESEARCH-BEE
        </Link>
        <Link href="/login" className="text-ic-text-primary hover:text-ic-yellow-accent transition">
          Log in
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)] px-4 py-20 overflow-hidden">
          {/* Subtle Background Pattern - Placeholder for potential SVG/CSS later */}
          <div className="absolute inset-0 z-0 opacity-10">
            {/* Example: Add subtle geometric pattern or radial gradient */}
            {/* <svg ...> or <div className="bg-radial-gradient..."> */}
          </div>
          
          <div className="z-10 flex flex-col items-center">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-ic-text-primary mb-6 max-w-4xl leading-tight">
              Discover Your Next Research Collaboration
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-ic-text-secondary mb-10 max-w-2xl">
              Join a vibrant community of student researchers. Share ideas, build projects, and accelerate your academic journey with Research-Bee.
            </p>
            <Link 
              href="/signup" 
              className="bg-white text-ic-dark-bg hover:bg-gray-200 font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ic-text-primary text-center mb-12 md:mb-16">
              Connect and Collaborate Seamlessly
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={FiSearch}
                title="Profile Discovery"
                description="Find student researchers by skills, interests, and project needs using powerful search and filtering tools."
              />
              <FeatureCard 
                icon={FiTarget}
                title="Project Matching"
                description="Post your research ideas or find ongoing projects seeking collaborators that align with your expertise."
              />
              <FeatureCard 
                icon={FiUsers}
                title="Build Your Network"
                description="Connect with peers, mentors, and potential supervisors to expand your academic and professional circle."
              />
              <FeatureCard 
                icon={FiMessageSquare}
                title="Secure Messaging"
                description="Initiate conversations and collaborate securely through our integrated messaging system."
              />
               {/* Add more features as needed */}
               <div className="md:col-span-1 lg:col-span-1"> {/* Placeholder to balance grid or add another feature */}
                 {/* Example: 
                 <FeatureCard 
                   icon={FiAward}
                   title="Showcase Your Work"
                   description="Display your publications, projects, and achievements on your public profile."
                 /> 
                 */}
               </div>
               <div className="md:col-span-1 lg:col-span-1"> {/* Placeholder */}
                 {/* Example: 
                 <FeatureCard 
                   icon={FiZap}
                   title="Idea Validation"
                   description="Get feedback on early-stage research concepts within a trusted community environment."
                 /> 
                 */}
               </div>
            </div>
          </div>
        </section>

        {/* How It Works Section (Optional - Simple Version) */}
        <section className="py-16 md:py-24 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ic-text-primary mb-12">
              Get Started in 3 Simple Steps
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-ic-yellow-accent text-ic-dark-bg flex items-center justify-center text-2xl font-bold mb-4">1</div>
                <h3 className="text-xl font-semibold text-ic-text-primary mb-2">Create Profile</h3>
                <p className="text-ic-text-secondary">Sign up for free and showcase your research interests and skills.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-ic-yellow-accent text-ic-dark-bg flex items-center justify-center text-2xl font-bold mb-4">2</div>
                <h3 className="text-xl font-semibold text-ic-text-primary mb-2">Discover Peers</h3>
                <p className="text-ic-text-secondary">Browse profiles or search for specific expertise to find potential collaborators.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-ic-yellow-accent text-ic-dark-bg flex items-center justify-center text-2xl font-bold mb-4">3</div>
                <h3 className="text-xl font-semibold text-ic-text-primary mb-2">Connect & Collaborate</h3>
                <p className="text-ic-text-secondary">Initiate contact, discuss ideas, and start collaborating on research projects.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action (Optional - Can reuse hero button or add another) */}
        {/* 
        <section className="py-16 bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <h2 className="text-3xl font-bold text-ic-text-primary mb-6">Ready to Find Your Research Partner?</h2>
             <Link 
              href="/signup" 
              className="bg-ic-yellow-accent text-ic-dark-bg hover:bg-ic-yellow-accent-dark font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-md hover:shadow-lg"
             >
              Sign Up For Free
            </Link>
          </div>
        </section> 
        */}

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-ic-text-secondary text-sm bg-black border-t border-ic-border/30">
        &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
      </footer>
    </div>
  );
}
