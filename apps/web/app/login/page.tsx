"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
        throw signInError;
      }

      if (data?.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login. Please try again.");
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
          <CardTitle className="text-4xl text-center">Welcome Back</CardTitle>
          <CardDescription className="mt-2 text-center">
            Sign in to continue your research journey.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="p-3 mb-6 bg-red-600/40 border border-red-500/60 rounded-lg text-white text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-sm text-researchbee-yellow hover:text-researchbee-yellow-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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
                Sign In
              </Button>
            </div>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-300">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-researchbee-yellow hover:text-researchbee-yellow-dark transition-colors"
              >
                Sign up now
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