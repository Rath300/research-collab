"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiArrowRight, FiUsers, FiTarget, FiClock, FiSearch, FiBook, FiLayers, FiCode, FiMessageCircle, FiPlay, FiCheckCircle, FiDatabase, FiCalendar, FiFileText } from 'react-icons/fi';

export default function Home() {
  const [activeSection, setActiveSection] = useState('all');
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  // Handle header background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-researchbee-black text-white">
      {/* Navigation */}
      <header className="border-b border-researchbee-medium-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-researchbee-yellow rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">RB</span>
              </div>
              <span className="ml-3 text-xl font-bold">Research-Bee</span>
            </div>
            <div className="hidden md:flex space-x-10">
              <a href="#features" className="text-researchbee-light-gray hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-researchbee-light-gray hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-researchbee-light-gray hover:text-white transition-colors">Testimonials</a>
              <a href="#faq" className="text-researchbee-light-gray hover:text-white transition-colors">FAQ</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-white hover:text-researchbee-yellow transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="bg-researchbee-yellow text-black px-4 py-2 rounded-md font-medium hover:bg-researchbee-yellow-dark transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Streamline Your Research Workflow
            </h1>
            <p className="text-xl text-researchbee-light-gray mb-10">
              Research-Bee helps academic researchers organize projects, collaborate with peers, and track progress from idea to publication.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/signup" 
                className="bg-researchbee-yellow text-black px-6 py-3 rounded-md font-medium hover:bg-researchbee-yellow-dark transition-colors flex items-center justify-center"
              >
                Start Free Trial <FiArrowRight className="ml-2" />
              </Link>
              <a 
                href="#features" 
                className="border border-researchbee-medium-gray text-white px-6 py-3 rounded-md font-medium hover:bg-researchbee-medium-gray transition-colors flex items-center justify-center"
              >
                Explore Features
              </a>
            </div>
          </div>
          
          <div className="mt-16 relative">
            <div className="bg-researchbee-dark-gray rounded-lg shadow-2xl overflow-hidden">
              <div className="h-96 w-full relative bg-gradient-to-r from-researchbee-dark-gray to-researchbee-medium-gray">
                {/* Placeholder for dashboard screenshot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-researchbee-light-gray">Dashboard Preview</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-researchbee-black text-researchbee-yellow px-6 py-3 rounded-full font-medium border border-researchbee-yellow">
              Trusted by 1000+ researchers worldwide
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-researchbee-dark-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Powerful Research Management Tools</h2>
            <p className="mt-4 text-xl text-researchbee-light-gray">
              Everything you need to manage your academic research from start to finish
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-researchbee-medium-gray p-6 rounded-lg">
              <div className="h-12 w-12 bg-researchbee-yellow/20 rounded-lg flex items-center justify-center mb-4">
                <FiDatabase className="h-6 w-6 text-researchbee-yellow" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Project Organization</h3>
              <p className="text-researchbee-light-gray">
                Keep all your research projects organized with customizable categories, tags, and status tracking.
              </p>
            </div>
            
            <div className="bg-researchbee-medium-gray p-6 rounded-lg">
              <div className="h-12 w-12 bg-researchbee-yellow/20 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="h-6 w-6 text-researchbee-yellow" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaboration Tools</h3>
              <p className="text-researchbee-light-gray">
                Invite colleagues, assign tasks, and communicate within the platform to streamline teamwork.
              </p>
            </div>
            
            <div className="bg-researchbee-medium-gray p-6 rounded-lg">
              <div className="h-12 w-12 bg-researchbee-yellow/20 rounded-lg flex items-center justify-center mb-4">
                <FiCalendar className="h-6 w-6 text-researchbee-yellow" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Timeline Management</h3>
              <p className="text-researchbee-light-gray">
                Set deadlines, track milestones, and visualize your research timeline to stay on schedule.
              </p>
            </div>
            
            <div className="bg-researchbee-medium-gray p-6 rounded-lg">
              <div className="h-12 w-12 bg-researchbee-yellow/20 rounded-lg flex items-center justify-center mb-4">
                <FiFileText className="h-6 w-6 text-researchbee-yellow" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Publication Tracking</h3>
              <p className="text-researchbee-light-gray">
                Manage the publication process from submission to acceptance, with journal tracking and citation tools.
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <div className="bg-researchbee-medium-gray rounded-lg p-8">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">All Your Research in One Place</h3>
                  <p className="text-researchbee-light-gray mb-6">
                    Research-Bee integrates seamlessly with your existing tools and workflows, bringing everything into a single, unified platform.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Centralized document storage and versioning",
                      "Integrated literature review tools",
                      "Data collection and analysis tracking",
                      "Automatic progress reporting",
                      "Grant management and funding tracking"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FiCheckCircle className="h-5 w-5 text-researchbee-yellow mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-researchbee-dark-gray h-80 rounded-lg relative">
                  {/* Placeholder for feature screenshot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-researchbee-light-gray">Feature Screenshot</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-xl text-researchbee-light-gray">
              Choose the plan that fits your research needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-researchbee-dark-gray rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Basic</h3>
                <p className="text-researchbee-light-gray mb-4">Perfect for individual researchers</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-researchbee-light-gray">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "3 active research projects",
                    "Basic collaboration tools",
                    "1GB document storage",
                    "Email support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="h-5 w-5 text-researchbee-yellow mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/signup?plan=basic" 
                  className="block w-full bg-researchbee-medium-gray hover:bg-researchbee-medium-gray/80 text-white text-center py-2 rounded-md font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
            
            <div className="bg-researchbee-dark-gray rounded-lg overflow-hidden border-2 border-researchbee-yellow relative">
              <div className="absolute top-0 right-0 bg-researchbee-yellow text-black px-3 py-1 text-sm font-medium">
                Most Popular
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Professional</h3>
                <p className="text-researchbee-light-gray mb-4">For active academic researchers</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-researchbee-light-gray">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited research projects",
                    "Advanced collaboration tools",
                    "10GB document storage",
                    "Priority email support",
                    "Publication tracking",
                    "Custom reporting"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="h-5 w-5 text-researchbee-yellow mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/signup?plan=professional" 
                  className="block w-full bg-researchbee-yellow hover:bg-researchbee-yellow-dark text-black text-center py-2 rounded-md font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
            
            <div className="bg-researchbee-dark-gray rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Team</h3>
                <p className="text-researchbee-light-gray mb-4">For research groups and labs</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-researchbee-light-gray">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited research projects",
                    "Team collaboration suite",
                    "50GB document storage",
                    "24/7 priority support",
                    "Advanced analytics",
                    "Grant management tools",
                    "Team permissions and roles"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="h-5 w-5 text-researchbee-yellow mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/signup?plan=team" 
                  className="block w-full bg-researchbee-medium-gray hover:bg-researchbee-medium-gray/80 text-white text-center py-2 rounded-md font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-researchbee-light-gray">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <p className="mt-2 text-researchbee-light-gray">
              Need a custom plan for your institution? <a href="#" className="text-researchbee-yellow hover:underline">Contact us</a>
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-researchbee-dark-gray to-researchbee-medium-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Research Workflow?</h2>
          <p className="text-xl text-researchbee-light-gray mb-8">
            Join thousands of researchers who have streamlined their work with Research-Bee.
          </p>
          <Link 
            href="/signup" 
            className="inline-block bg-researchbee-yellow text-black px-8 py-3 rounded-md font-medium hover:bg-researchbee-yellow-dark transition-colors"
          >
            Start Your Free Trial
          </Link>
          <p className="mt-4 text-sm text-researchbee-light-gray">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-researchbee-black py-12 border-t border-researchbee-medium-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-researchbee-yellow rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">RB</span>
                </div>
                <span className="ml-2 text-lg font-bold">Research-Bee</span>
              </div>
              <p className="text-researchbee-light-gray text-sm">
                Empowering researchers to organize, collaborate, and publish with ease.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Security", "Testimonials"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-researchbee-light-gray hover:text-white text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-researchbee-light-gray hover:text-white text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {["Documentation", "Help Center", "API", "Community"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-researchbee-light-gray hover:text-white text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-researchbee-medium-gray flex flex-col md:flex-row justify-between items-center">
            <p className="text-researchbee-light-gray text-sm">
              © {new Date().getFullYear()} Research-Bee. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {["Terms", "Privacy", "Cookies"].map((item, index) => (
                <a key={index} href="#" className="text-researchbee-light-gray hover:text-white text-sm">
                  {item}
                </a>
              ))}
            </div>
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
  {
    title: "Real-time Collaboration",
    description: "Work together on documents, data analysis, and research papers in real-time.",
    icon: FiCode,
  },
  {
    title: "Opportunity Finder",
    description: "Discover funding opportunities, conferences, and publication venues in your field.",
    icon: FiLayers,
  },
  {
    title: "Research Analytics",
    description: "Track the impact and reach of your research with comprehensive analytics.",
    icon: FiMessageCircle,
  },
];
