"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiArrowRight, FiUsers, FiTarget, FiClock, FiSearch, FiBook, FiLayers, FiCode, FiMessageCircle, FiPlay, FiCheckCircle, FiDatabase, FiCalendar, FiFileText } from 'react-icons/fi';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ic-dark-bg flex flex-col items-center justify-center px-4">
      <header className="w-full py-8 flex justify-between items-center">
        <span className="text-3xl font-bold text-ic-yellow-accent">RESEARCH-BEE</span>
        <Link href="/login" className="bg-ic-yellow-accent text-ic-dark-bg px-6 py-2 rounded font-semibold hover:bg-ic-yellow-accent-dark transition">Log in</Link>
      </header>
      <main className="flex flex-col items-center mt-12 w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-ic-text-primary text-center mb-4">Get your research organized, <span className="text-ic-yellow-accent">for free</span></h1>
        <p className="text-xl text-ic-text-secondary text-center mb-6">Completely Free For ALL. No credit card required.</p>
        <Link href="/signup" className="bg-ic-yellow-accent text-ic-dark-bg px-8 py-3 rounded-lg font-bold text-lg mb-8 hover:bg-ic-yellow-accent-dark transition">Get Started</Link>
        <div className="w-full bg-researchbee-medium-gray rounded-lg flex items-center justify-center h-64 mb-8">
          <span className="text-ic-yellow-accent text-xl font-semibold">Video coming soon</span>
        </div>
        <section className="w-full">
          <h2 className="text-2xl font-bold text-ic-text-primary mb-4">Core Features</h2>
          <ul className="space-y-3">
            <li className="flex items-center text-ic-text-secondary">
              <span className="inline-block w-6 h-6 mr-2 rounded-full bg-ic-yellow-accent text-ic-dark-bg flex items-center justify-center font-bold">✓</span>
              Real-time collaborative research boards
            </li>
            <li className="flex items-center text-ic-text-secondary">
              <span className="inline-block w-6 h-6 mr-2 rounded-full bg-ic-yellow-accent text-ic-dark-bg flex items-center justify-center font-bold">✓</span>
              AI-powered note organization
            </li>
            <li className="flex items-center text-ic-text-secondary">
              <span className="inline-block w-6 h-6 mr-2 rounded-full bg-ic-yellow-accent text-ic-dark-bg flex items-center justify-center font-bold">✓</span>
              Secure cloud storage
            </li>
            <li className="flex items-center text-ic-text-secondary">
              <span className="inline-block w-6 h-6 mr-2 rounded-full bg-ic-yellow-accent text-ic-dark-bg flex items-center justify-center font-bold">✓</span>
              Export to PDF & Markdown
            </li>
          </ul>
        </section>
      </main>
      <footer className="w-full py-8 text-center text-ic-text-secondary text-sm mt-12">
        &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
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
