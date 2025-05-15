'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FiMail, FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i:number) => ({
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, delay: i * 0.1 }
    }),
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-neutral-100 font-sans">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="font-heading text-2xl font-bold text-neutral-200 hover:text-neutral-100 transition-colors">
          RESEARCH-BEE
        </Link>
      </div>
        
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="w-full max-w-lg"
      >
        <Card className="w-full bg-neutral-950 border-none shadow-none p-6 sm:p-8">
          <CardHeader className="text-center">
            <motion.div custom={0} variants={itemVariants} className="mx-auto h-20 w-20 rounded-full bg-accent-purple/10 flex items-center justify-center border border-accent-purple/30 mb-4">
              <FiMail className="h-10 w-10 text-accent-purple" />
            </motion.div>
            <motion.div custom={1} variants={itemVariants}>
              <CardTitle className="font-heading text-3xl sm:text-4xl font-semibold text-neutral-100">
                Verify Your Email
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-neutral-400 font-sans">
                We&apos;ve sent a confirmation link to your email address. Please click it to activate your account.
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-6 mt-4">
            <motion.div 
              custom={2} 
              variants={itemVariants} 
              className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 text-sm"
            >
              <p className="font-medium text-neutral-100 mb-2">Important Note:</p>
              <p className="text-neutral-300">
                If the confirmation link seems broken or doesn&apos;t work immediately:
              </p>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-neutral-400">
                <li>Copy the full URL from the confirmation email.</li>
                <li>Try pasting it directly into your browser&apos;s address bar.</li>
                <li>If issues persist, you can try to 
                  <Link href="/login" className="font-medium text-accent-purple hover:text-accent-purple-hover transition-colors"> login </Link> 
                   with your credentials; sometimes this helps complete verification.
                </li>
                <li>Still stuck? Please <Link href="mailto:support@research-bee.com" className="font-medium text-accent-purple hover:text-accent-purple-hover transition-colors">contact support</Link>.</li>
              </ol>
            </motion.div>
            
            <motion.div custom={3} variants={itemVariants} className="text-center">
              <p className="text-neutral-400">
                Didn&apos;t receive an email? Check your spam folder or try signing up again.
              </p>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 mt-6">
            <motion.div custom={4} variants={itemVariants} className="w-full">
              <Link href="/login" passHref className="block w-full">
                <Button 
                  isFullWidth 
                  className="w-full px-4 py-3 bg-accent-purple hover:bg-accent-purple-hover text-white font-sans font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-neutral-950 transition-colors"
                  size="lg"
                >
                  Go to Login
                  <FiArrowRight className="ml-2" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div custom={5} variants={itemVariants} className="border-t border-neutral-800 pt-4 mt-2 w-full text-center">
              <Link
                href="https://app.supabase.com/project/yltnvmypasnfdgtnyhwg/auth/users"
                target="_blank"
                className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center justify-center transition-colors"
              >
                <span>View Supabase Users (Dev)</span>
                <FiExternalLink className="ml-1.5 h-3 w-3" />
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }} 
        className="absolute bottom-6 text-center w-full text-xs text-neutral-600 font-sans"
      >
        &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
      </motion.footer>
    </div>
  );
} 