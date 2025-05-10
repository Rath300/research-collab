"use client";

import Link from "next/link";
import { FiMail } from "react-icons/fi";

export default function CheckEmail() {
  return (
    <div className="min-h-screen bg-researchbee-black flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-researchbee-yellow">
          RESEARCH-BEE
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-researchbee-yellow-dark/20 flex items-center justify-center">
            <FiMail className="h-12 w-12 text-researchbee-yellow" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white">Check your email</h2>
            <p className="mt-4 text-researchbee-light-gray">
              We've sent a confirmation link to your email address. Please click the link to verify your account.
            </p>
          </div>
          
          <div className="netflix-card p-6">
            <h3 className="text-lg font-medium text-white mb-2">What's next?</h3>
            <ol className="list-decimal list-inside text-researchbee-light-gray space-y-2 text-left">
              <li>Check your email inbox (and spam folder) for the confirmation message</li>
              <li>Click the verification link in the email</li>
              <li>Once verified, you'll be able to sign in to Research-Bee</li>
            </ol>
          </div>
          
          <div className="pt-4">
            <Link href="/login" className="netflix-btn netflix-btn-secondary">
              Return to sign in
            </Link>
          </div>
          
          <p className="text-sm text-researchbee-light-gray mt-8">
            Didn't receive an email? Check your spam folder or{" "}
            <Link href="/signup" className="text-researchbee-yellow hover:text-researchbee-yellow-dark">
              try signing up again
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-researchbee-light-gray text-sm">
        <p>&copy; {new Date().getFullYear()} Research-Bee. All rights reserved.</p>
      </footer>
    </div>
  );
} 