"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

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
    <div className="min-h-screen bg-researchbee-black flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-researchbee-yellow">
          RESEARCH-BEE
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Create account</h2>
            <p className="mt-2 text-researchbee-light-gray">
              Join Research-Bee and revolutionize your research
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded text-white text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="netflix-label">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter your first name"
                  className="netflix-input"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="netflix-label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Enter your last name"
                  className="netflix-input"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="netflix-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className="netflix-input"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="netflix-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                className="netflix-input"
                minLength={6}
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
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-researchbee-light-gray">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-researchbee-yellow hover:text-researchbee-yellow-dark"
              >
                Sign in
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