"use client";

import Link from "next/link";
import { FiMail } from "react-icons/fi";
import { motion } from 'framer-motion';

export default function CheckEmail() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-neutral-100 font-sans">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="w-full max-w-md space-y-8 text-center"
      >
        <motion.div
          variants={itemVariants}
          className="mx-auto h-24 w-24 rounded-full bg-accent-purple/10 flex items-center justify-center border border-accent-purple/30"
        >
          <FiMail className="h-12 w-12 text-accent-purple" />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-heading font-semibold text-neutral-100">Check your email</h2>
          <p className="mt-3 text-neutral-400">
            We&apos;ve sent a confirmation link to your email address. Please click the link to verify your account.
          </p>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="p-6 bg-neutral-900 rounded-lg border border-neutral-800 shadow-lg"
        >
          <h3 className="text-lg font-medium text-neutral-100 mb-3">What&apos;s next?</h3>
          <ol className="list-decimal list-inside text-neutral-400 space-y-2 text-left text-sm">
            <li>Check your email inbox (and spam folder) for the confirmation message</li>
            <li>Click the verification link in the email</li>
            <li>Once verified, you&apos;ll be able to sign in to Research-Bee</li>
          </ol>
        </motion.div>
        
        <motion.div variants={itemVariants} className="pt-4">
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-accent-purple hover:bg-accent-purple-hover text-white font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-neutral-950"
          >
            Return to Sign In
          </Link>
        </motion.div>
        
        <motion.p variants={itemVariants} className="text-sm text-neutral-500 pt-4">
          Didn&apos;t receive an email? Check your spam folder or{" "}
          <Link href="/signup" className="font-medium text-accent-purple hover:text-accent-purple-hover transition-colors">
            try signing up again
          </Link>
          .
        </motion.p>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }} 
        className="absolute bottom-6 text-center w-full text-xs text-neutral-600 font-sans"
      >
        <Link href="/" className="font-heading text-lg font-bold text-neutral-300 hover:text-neutral-100 transition-colors mb-2 block">
          RESEARCH-BEE
        </Link>
        &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
      </motion.footer>
    </div>
  );
} 