"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js"; // Add this import

export default function page() {
  const [user, setUser] = useState<null | User>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth/login"); // redirect if not logged in
      } else {
        console.log("data user : ",data.user);
        setUser(data.user);
      }
    };
    getUser();
  }, [router]);

  return <div>{user ? `Welcome ${user.email}` : "Loading..."}</div>;
}
