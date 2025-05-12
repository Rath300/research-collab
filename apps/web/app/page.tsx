"use client";

import Link from 'next/link';
import { FiSearch, FiUsers, FiMessageSquare, FiTarget } from 'react-icons/fi';
import { motion } from 'framer-motion';

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-ic-text-primary flex flex-col">
      {/* Header - Updated to remove yellow accents */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center sticky top-0 z-50 bg-black/70 backdrop-blur-lg border-b border-neutral-800">
        <Link href="/" className="font-heading text-3xl font-semibold text-neutral-100 tracking-tight hover:text-white transition-colors">
          RESEARCH-BEE
        </Link>
        <Link href="/login" className="font-sans text-neutral-300 hover:text-white transition-colors">
                Log in
              </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section - Styled for high contrast and modern feel */}
        <motion.section 
          className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-100px)] px-4 py-20 overflow-hidden bg-black"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
          }}
        >
          {/* Subtle Background Pattern - Placeholder for potential SVG/CSS later */}
          <div className="absolute inset-0 z-0 opacity-10">
            {/* Example: Add subtle geometric pattern or radial gradient */}
            {/* <svg ...> or <div className="bg-radial-gradient..."> */}
          </div>
          
          <div className="z-10 flex flex-col items-center">
            <motion.h1 
              className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-neutral-100 mb-8 max-w-5xl leading-tight tracking-tight"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              Discover Your Next Research Collaboration
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
                className="inline-block bg-white text-neutral-900 hover:bg-neutral-200 font-sans font-medium py-3 px-8 rounded-md text-base sm:text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-black"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          id="features" 
          className="py-16 md:py-24 bg-black"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% of the section is visible
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } } // Stagger children (title and grid)
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="font-heading text-3xl md:text-4xl font-bold text-ic-text-primary text-center mb-12 md:mb-16"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              Connect and Collaborate Seamlessly
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={{
                // Inherit parent's visible state, but apply stagger to direct children (FeatureCards)
                visible: { transition: { staggerChildren: 0.15 } }
              }}
            >
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
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section (Vertical Timeline Style) */}
        <motion.section 
          className="py-16 md:py-24 bg-black"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } }
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="font-heading text-3xl md:text-4xl font-bold text-ic-text-primary mb-12"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              Get Started in 3 Simple Steps
            </motion.h2>
            <motion.div 
              className="flex flex-col items-center space-y-12 md:space-y-16 mt-16" 
              variants={{
                visible: { transition: { staggerChildren: 0.2 } }
              }}
            >
              {/* Step 1 */}
              <motion.div 
                className="flex flex-col items-center text-center max-w-md"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
              >
                {/* Styled Number Circle */}
                <div className="w-20 h-20 rounded-full border-2 border-neutral-700 text-white flex items-center justify-center text-3xl font-heading font-semibold mb-6">1</div>
                {/* Heading Font */}
                <h3 className="text-2xl font-heading font-semibold text-ic-text-primary mb-3">Create Profile</h3>
                {/* Sans Font (Inter), Adjusted size/color */}
                <p className="text-ic-text-secondary text-base leading-relaxed">Sign up for free and showcase your research interests and skills.</p>
              </motion.div>
              
              {/* Step 2 */}
              <motion.div 
                className="flex flex-col items-center text-center max-w-md"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
              >
                 {/* Styled Number Circle */}
                <div className="w-20 h-20 rounded-full border-2 border-neutral-700 text-white flex items-center justify-center text-3xl font-heading font-semibold mb-6">2</div>
                 {/* Heading Font */}
                <h3 className="text-2xl font-heading font-semibold text-ic-text-primary mb-3">Discover Peers</h3>
                 {/* Sans Font (Inter), Adjusted size/color */}
                <p className="text-ic-text-secondary text-base leading-relaxed">Browse profiles or search for specific expertise to find potential collaborators.</p>
              </motion.div>
              
              {/* Step 3 */}
              <motion.div 
                className="flex flex-col items-center text-center max-w-md"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
              >
                 {/* Styled Number Circle */}
                <div className="w-20 h-20 rounded-full border-2 border-neutral-700 text-white flex items-center justify-center text-3xl font-heading font-semibold mb-6">3</div>
                 {/* Heading Font */}
                <h3 className="text-2xl font-heading font-semibold text-ic-text-primary mb-3">Connect & Collaborate</h3>
                 {/* Sans Font (Inter), Adjusted size/color */}
                <p className="text-ic-text-secondary text-base leading-relaxed">Initiate contact, discuss ideas, and start collaborating on research projects.</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

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
