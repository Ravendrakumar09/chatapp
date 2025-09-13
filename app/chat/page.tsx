"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function page() {
  const [user, setUser] = useState<null | User>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login"); // redirect if not logged in
      } else {
        console.log("data user : ",data.user);
        setUser(data.user);
      }
    };
    getUser();
  }, [router]);

  return <div>{user ? `Welcome ${user.email}` : "Loading..."}</div>;
}
