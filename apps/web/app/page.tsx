"use client";

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

// Feature Stat Component (Inspired by Image 1)
const FeatureStat = ({ stat, description }: { stat: string, description: string }) => (
  <div className="text-center py-8 md:py-12">
    <p className="font-heading text-6xl md:text-8xl font-bold text-ic-text-primary mb-3">{stat}</p>
    <p className="font-sans text-lg text-ic-text-secondary max-w-xs mx-auto">{description}</p>
  </div>
);

// Timeline Step Component (Inspired by Image 2)
const TimelineStep = ({ title, items }: { title: string, items: string[] }) => (
  <div className="relative pl-8 py-6 group">
    {/* Vertical Line */}
    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-ic-border/30 group-last:h-[calc(100%-2rem)]"></div>
    
    {/* Dot on Line */}
    <div className="absolute left-[9px] top-[1.75rem] w-2 h-2 rounded-full bg-ic-yellow-accent"></div>

    {/* Card Content */}
    <div className="bg-ic-dark-gray p-6 rounded-lg border border-ic-border/50 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-2xl font-semibold text-ic-text-primary">{title}</h3>
        <CheckCircle className="w-6 h-6 text-green-500" />
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center font-sans text-ic-text-secondary">
            <span className="text-ic-yellow-accent/80 mr-2">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-ic-text-primary flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center sticky top-0 z-50 bg-black/70 backdrop-blur-lg border-b border-white/10">
        <Link href="/" className="font-heading text-3xl font-bold text-ic-yellow-accent tracking-tight">
          RESEARCH-BEE
        </Link>
        <Link href="/login" className="font-sans text-ic-text-primary hover:text-ic-yellow-accent transition">
          Log in
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)] px-4 py-20 overflow-hidden">
          {/* Subtle Background Pattern - Placeholder for potential SVG/CSS later */}
          <div className="absolute inset-0 z-0 opacity-[0.03]">
             {/* Example basic dot pattern */}
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dot-pattern" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#dot-pattern)" /></svg>
          </div>
          
          <div className="z-10 flex flex-col items-center">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-ic-text-primary mb-6 max-w-4xl leading-tight">
              Discover Your Next Research Collaboration
            </h1>
            <p className="font-sans text-lg sm:text-xl md:text-2xl text-ic-text-secondary mb-10 max-w-2xl">
              Join a vibrant community of student researchers. Share ideas, build projects, and accelerate your academic journey with Research-Bee.
            </p>
            <Link 
              href="/signup" 
              className="font-sans bg-white text-ic-dark-bg hover:bg-gray-200 font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features Section (Inspired by Image 1 - Stats) */}
        <section id="features" className="py-16 md:py-24 bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
             <h2 className="font-heading text-4xl md:text-5xl font-bold text-ic-text-primary text-center mb-12 md:mb-16">
              Find Your Perfect Match
            </h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Replace with relevant stats */}
              <FeatureStat stat="1000s" description="Of student researchers actively seeking collaboration." />
              <FeatureStat stat="Diverse" description="Fields represented, from STEM to Humanities." />
              <FeatureStat stat="Zero Cost" description="Completely free platform for all students." />
              <FeatureStat stat="Instant" description="Connections through our secure messaging." />
            </div>
          </div>
        </section>
        
        {/* How to Get Started Section (Inspired by Image 2 - Timeline) */}
        <section id="get-started" className="py-16 md:py-24 bg-black">
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
             {/* Example basic dot pattern */}
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dot-pattern-2" width="15" height="15" patternUnits="userSpaceOnUse"><circle cx="7.5" cy="7.5" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#dot-pattern-2)" /></svg>
          </div>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <h2 className="font-heading text-4xl md:text-5xl font-bold text-ic-text-primary text-center mb-16">
              How Research-Bee Works
            </h2>
            <div>
              <TimelineStep 
                title="Sign Up & Profile" 
                items={[
                  "Create your free account in minutes.",
                  "Showcase skills, interests, and project ideas.",
                  "Set your collaboration preferences."
                ]} 
              />
              <TimelineStep 
                title="Discover & Search" 
                items={[
                  "Browse profiles based on field or keywords.",
                  "Filter researchers by availability or skills.",
                  "Explore posted project opportunities."
                ]} 
              />
              <TimelineStep 
                title="Connect & Collaborate" 
                items={[
                  "Send connection requests securely.",
                  "Use built-in messaging to discuss ideas.",
                  "Start your next research project together."
                ]} 
              />
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-ic-text-secondary text-sm font-sans bg-black border-t border-ic-border/30">
        &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
      </footer>
    </div>
  );
}
