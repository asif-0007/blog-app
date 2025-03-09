'use client';

import { Button } from "@/components/ui/button";
import { useSupabase } from "./supabase-provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function SignOutButton() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      });

      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleSignOut}
      className="whitespace-nowrap"
    >
      Sign Out
    </Button>
  );
} 