"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/lib/store";
import { AuthForm } from "@/components/auth/AuthForm";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { setUser, setProfile } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-researchbee-black flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-researchbee-yellow">
          RESEARCH-BEE
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Sign in</h2>
            <p className="mt-2 text-researchbee-light-gray">
              Access your Research-Bee account
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded text-white text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="netflix-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="netflix-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="netflix-label">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-sm text-researchbee-yellow hover:text-researchbee-yellow-dark"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="netflix-input"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="netflix-btn netflix-btn-primary w-full flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-researchbee-black rounded-full"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-researchbee-light-gray">
              New to Research-Bee?{" "}
              <Link
                href="/auth/signup"
                className="text-researchbee-yellow hover:text-researchbee-yellow-dark"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-researchbee-light-gray text-sm">
        <p>&copy; {new Date().getFullYear()} Research-Bee. All rights reserved.</p>
      </footer>
    </div>
  );
} 