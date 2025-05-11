"use client";

import Link from "next/link";
import { useState } from "react";
import { FiUser, FiMenu, FiX, FiBell, FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from '@/lib/store';

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = getBrowserClient();
  const { profile } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="bg-researchbee-dark-gray shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-researchbee-yellow">RESEARCH-BEE</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 bg-researchbee-black text-white placeholder-researchbee-light-gray pl-10 pr-4 py-2 rounded-md border border-researchbee-medium-gray focus:outline-none focus:ring-1 focus:ring-researchbee-yellow"
                />
                <FiSearch className="absolute left-3 top-2.5 text-researchbee-light-gray" />
              </div>
              
              <Link href="/notifications" className="relative p-2 rounded-full hover:bg-researchbee-medium-gray">
                <FiBell className="h-5 w-5 text-researchbee-light-gray" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-researchbee-yellow"></span>
              </Link>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-researchbee-medium-gray">
                  <div className="h-8 w-8 rounded-full bg-researchbee-light-gray flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-researchbee-dark-gray" />
                  </div>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-researchbee-dark-gray shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                  <div className="py-1">
                    <div className="block px-4 py-2 text-xs text-researchbee-light-gray">
                      {user?.email}
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-white hover:bg-researchbee-medium-gray">
                      Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-white hover:bg-researchbee-medium-gray">
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-researchbee-medium-gray"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-researchbee-light-gray p-2 rounded-md"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-white hover:bg-researchbee-medium-gray">
              Dashboard
            </Link>
            <Link href="/projects" className="block px-3 py-2 rounded-md text-white hover:bg-researchbee-medium-gray">
              Projects
            </Link>
            <Link href="/library" className="block px-3 py-2 rounded-md text-white hover:bg-researchbee-medium-gray">
              Library
            </Link>
            <Link href="/profile" className="block px-3 py-2 rounded-md text-white hover:bg-researchbee-medium-gray">
              Profile
            </Link>
            <Link href="/settings" className="block px-3 py-2 rounded-md text-white hover:bg-researchbee-medium-gray">
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-md text-white hover:bg-researchbee-medium-gray"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
} 