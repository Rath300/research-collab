"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = getBrowserClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <header className="absolute top-0 left-0 w-full py-6 px-4 sm:px-6 lg:px-8 flex justify-start">
        <Link href="/" className="text-3xl font-bold text-researchbee-yellow tracking-tight">
          RESEARCH-BEE
        </Link>
      </header>

      <Card className="w-full max-w-md transform transition-all duration-500 ease-out animate-fade-in animate-slide-up">
        <CardHeader>
          <CardTitle className="text-4xl text-center">Create Account</CardTitle>
          <CardDescription className="mt-2 text-center">
            Join Research-Bee and revolutionize your research journey.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="p-3 mb-6 bg-red-600/40 border border-red-500/60 rounded-lg text-white text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1.5">
                  First Name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1.5">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1.5">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1.5">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password (min. 6 characters)"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1.5">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                minLength={6}
              />
            </div>

            <div>
              <Button
                type="submit"
                isLoading={isLoading}
                isFullWidth={true}
                variant="accent"
                size="lg"
                className="transform hover:scale-105 active:scale-95"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-researchbee-yellow hover:text-researchbee-yellow-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <footer className="absolute bottom-0 w-full py-6 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Research-Bee. All rights reserved. </p>
      </footer>
    </div>
  );
} 