"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      // supabase is already imported as a singleton
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        router.push("/auth/check-email");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <span className="text-neutral-400 font-sans animate-pulse">Loading...</span>
      </div>
    );
  }

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
                Create Account
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-neutral-400 font-sans">
                Start your collaboration journey today.
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
              onSubmit={handleSignup}
              className="space-y-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="sr-only">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Full name"
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors"
                  />
                </div>

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
                    placeholder="Work email"
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password (min. 6 characters)"
                    minLength={6}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm password"
                    minLength={6}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-transparent text-neutral-200 placeholder:text-neutral-500 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  isFullWidth
                  className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-sans font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-950 transition-colors"
                  size="lg"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </motion.form>

            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-sm text-neutral-400 font-sans">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-neutral-300 hover:text-neutral-100 underline underline-offset-4 transition-colors">
                  Log in
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 