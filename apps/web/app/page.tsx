"use client";

import Link from 'next/link';
import { FiSearch, FiUsers, FiMessageSquare, FiTarget } from 'react-icons/fi';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

// Helper component for Feature Cards (Modern/Sleek)
const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <motion.div 
    className="bg-neutral-900 p-6 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-800"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }} // Trigger when 30% of the card is visible
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }}
  >
    <div className="mb-4">
      <Icon className="h-8 w-8 text-neutral-400" />
    </div>
    <h3 className="text-xl font-heading font-semibold text-ic-text-primary mb-2">{title}</h3>
    <p className="text-ic-text-secondary text-base leading-relaxed">{description}</p>
  </motion.div>
);

const features = [ 
  { 
    title: "Intelligent Profile Discovery", 
    description: "Find student researchers by skills, interests, and project needs using powerful search and filtering tools. Our AI helps surface the most relevant collaborators for you.",
  },
  { 
    title: "AI-Powered Project Matching", 
    description: "Post your research ideas or find ongoing projects. Our matching algorithm connects you with opportunities aligned with your expertise and aspirations.",
  },
  { 
    title: "Dynamic Network Building", 
    description: "Connect with peers, mentors, and potential supervisors. Expand your academic and professional circle within a vibrant, supportive community.",
  },
  { 
    title: "Secure & Streamlined Communication", 
    description: "Initiate conversations and collaborate securely through our integrated messaging system, designed for focused research discussions.",
  }
];

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((currentActiveIndex) => 
        (currentActiveIndex + 1) % features.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      {/* Header - Updated to remove yellow accents */}
              <header className="w-full py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center sticky top-0 z-50 bg-surface-primary/70 backdrop-blur-lg border-b border-border-light">
        <Link href="/" className="font-heading text-3xl font-semibold text-neutral-100 tracking-tight hover:text-white transition-colors">
          RESEARCH-BEE
        </Link>
        <div className="hidden md:flex items-center space-x-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-neutral-100 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple-hover rounded-md transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section - Styled for high contrast and modern feel */}
        <motion.section 
          className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-100px)] px-4 py-20 overflow-hidden bg-bg-primary"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
          }}
        >
          {/* Video Background */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline // Important for iOS
            className="absolute top-0 left-0 w-full h-full object-cover z-0" 
            style={{ filter: 'brightness(1.2)', opacity: 0.25 }} // Added brightness filter and adjusted opacity
          >
            <source src="/videos/3582427-hd_1920_1080_24fps (1) (online-video-cutter.com).mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Subtle Background Pattern - Kept for layering if desired, or remove if video is primary */}
          {/* <div className="absolute inset-0 z-0 opacity-10"> */}
            {/* Example: Add subtle geometric pattern or radial gradient */}
            {/* <svg ...> or <div className="bg-radial-gradient..."> */}
          {/* </div> */}
          
          <div className="z-10 flex flex-col items-center relative"> {/* Ensure content is above video */}
            <motion.h1 
              className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-neutral-100 mb-8 max-w-5xl leading-tight tracking-tight"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              Research for Everybody.
            </motion.h1>
            <motion.p 
              className="font-sans text-base sm:text-lg md:text-xl text-neutral-300 mb-12 max-w-2xl leading-relaxed"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              Join a vibrant community of student researchers. Share ideas, build projects, and accelerate your academic journey with Research-Bee.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-accent-purple hover:bg-accent-purple-hover border border-transparent rounded-md shadow-sm md:text-lg"
              >
                Get Started Free
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section - Redesigned to be Vertical with Animated Text */}
        <motion.section 
          id="features" 
          className="py-16 md:py-24 bg-bg-primary"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } } // Parent animation
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-100 text-center mb-12 md:mb-16"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              Key Features to Empower Your Research Journey
            </motion.h2>
            {/* Vertical list of features */}
            <motion.div 
              className="space-y-12 md:space-y-16"
              variants={{ // Stagger children for sequential animation
                visible: { transition: { staggerChildren: 0.4 } }
              }}
            >
              {features.map((feature, index) => {
                const isActive = index === activeIndex;
                return (
                  <motion.div 
                    key={index} 
                    className="flex flex-col md:flex-row items-center md:space-x-8" 
                    variants={{
                      hidden: { opacity: 0.5 },
                      visible: { opacity: 1, transition: { duration: 0.5 } }
                    }}
                    animate={isActive ? "visible" : "hidden"}
                    initial="hidden"
                  >
                <div>
                      <h3 className={`text-2xl md:text-3xl font-heading font-semibold mb-3 transition-colors duration-500 ${isActive ? 'text-neutral-100' : 'text-neutral-500'}`}>{feature.title}</h3>
                      <p className={`text-base md:text-lg leading-relaxed transition-colors duration-500 ${isActive ? 'text-neutral-300' : 'text-neutral-600'}`}>{feature.description}</p>
                </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section (Horizontal Steps) */}
        <motion.section 
          className="py-16 md:py-24 bg-bg-primary" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } } 
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="font-heading text-3xl md:text-4xl font-bold text-neutral-100 mb-12 md:mb-16"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              Get Started in 3 Simple Steps
            </motion.h2>
            {/* Horizontal layout for steps */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-16" 
              variants={{
                visible: { transition: { staggerChildren: 0.2 } } 
              }}
            >
              {[ // Array of steps for mapping
                { 
                  number: 1,
                  title: "Create Profile", 
                  description: "Sign up for free and showcase your research interests and skills." 
                },
                { 
                  number: 2,
                  title: "Discover Peers", 
                  description: "Browse profiles or search for specific expertise to find potential collaborators." 
                },
                { 
                  number: 3,
                  title: "Connect & Collaborate", 
                  description: "Initiate contact, discuss ideas, and start collaborating on research projects." 
                }
              ].map((step) => (
                <motion.div 
                  key={step.number}
                  className="flex flex-col items-center text-center" 
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-neutral-700 text-white flex items-center justify-center text-2xl font-heading font-semibold mb-6">{step.number}</div>
                  <h3 className="text-xl md:text-2xl font-heading font-semibold text-neutral-100 mb-3">{step.title}</h3>
                  <p className="text-neutral-300 text-base leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
              </div>
        </motion.section>

        {/* Placeholder for Features Video */}
        <section className="py-16 md:py-24 bg-neutral-900"> 
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-100 mb-6">See Research-Bee in Action</h2>
            <div className="aspect-video bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-500">
              {/* Replace this div with your video player component when ready */}
              <span>Video Coming Soon!</span> 
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
      <footer className="py-8 bg-surface-primary border-t border-border-light mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-500 text-sm">
          &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
