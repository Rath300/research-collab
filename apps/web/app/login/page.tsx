"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = getBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Handle Supabase specific errors if needed, e.g., invalid credentials
        console.error("Supabase Sign-In Error:", signInError);
        setError(signInError.message || "Invalid login credentials.");
        setIsLoading(false); // Stop loading on specific errors
        return; // Stop execution here
      }

      // If signInError did not occur, the login was successful.
      // Immediately redirect to the dashboard.
      console.log("Login successful via handleLogin, replacing route to /dashboard");
      router.replace('/dashboard'); 
      // Note: We might not even need to explicitly set loading to false here,
      // as the page navigation will unmount this component.

    } catch (err: any) {
      // Catch any other unexpected errors during the process
      console.error("Generic Login Error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false); // Ensure loading is stopped on generic errors
    }
    // Removed finally block as loading state is handled within try/catch
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="font-heading text-2xl font-bold text-neutral-200 hover:text-neutral-100 transition-colors">
          RESEARCH-BEE
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Card className="w-full bg-neutral-950 border-none shadow-none p-6 sm:p-8">
          <CardHeader className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle className="font-heading text-3xl sm:text-4xl font-semibold text-neutral-100">
                Sign In
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-neutral-400 font-sans">
                Welcome back, please enter your details.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 mb-4 bg-red-900/30 border border-red-700/50 rounded-md text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.form
              onSubmit={handleLogin}
              className="space-y-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <label htmlFor="email" className="sr-only"> 
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-end mb-1">
                  <Link
                    href="/reset-password"
                    className="text-xs font-sans text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors mb-2"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  isFullWidth={true}
                  className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-sans font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-950 transition-colors"
                  size="lg"
                >
                  Sign In
                </Button>
              </div>
            </motion.form>

            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-sm font-sans text-neutral-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-neutral-300 hover:text-neutral-100 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.footer
        className="absolute bottom-6 text-center w-full text-xs text-neutral-500 font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        &copy; {new Date().getFullYear()} Research-Bee. All rights reserved.
      </motion.footer>
    </div>
  );
} 