"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const getSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/chat");   // ✅ redirect works here
      } else {
        router.push("/login");  // fallback
      }
    };

    getSession();
  }, [router]);

  return <p>Finishing login…</p>;
}

 