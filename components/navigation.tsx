"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useSupabase } from "@/components/supabase-provider";

export function Navigation() {
  const pathname = usePathname();
  const { supabase, session } = useSupabase();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold">
            BLOGIT
          </Link>
          <div className="space-x-4">
            <Link
              href="/"
              className={pathname === "/" ? "text-primary" : "text-muted-foreground"}
            >
              Home
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className={pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}
              >
                Dashboard
              </Link>
            ) : null}
          </div>
        </nav>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {session ? (
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Sign Out
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}