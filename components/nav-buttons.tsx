'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./sign-out-button";
import { useSupabase } from "./supabase-provider";

export function NavButtons() {
  const { session } = useSupabase();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
        <SignOutButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/login">
        <Button variant="outline">Log in</Button>
      </Link>
      <Link href="/signup">
        <Button>Sign up</Button>
      </Link>
    </div>
  );
} 