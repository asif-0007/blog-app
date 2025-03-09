'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./sign-out-button";
import { useSupabase } from "./supabase-provider";

export function Navbar() {
  const { session } = useSupabase();

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 border-b border-indigo-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white hover:opacity-90 transition-colors">
              Blog App
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                    Dashboard
                  </Button>
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-white text-indigo-600 hover:bg-white/90">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 