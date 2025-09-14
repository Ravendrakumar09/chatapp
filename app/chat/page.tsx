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
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };
    getUser();
  }, [router]);

  const handleLogOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-200 via-white to-blue-200">
      {/* header */}
      <div className="flex flex-col bg-gray-200">
        <div className="flex justify-between p-4 bg-white shadow-md">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            {user ? (
              <span>
                <span className="text-red-600"> Welcome</span> {user.user_metadata.full_name}{" "}
              </span>
            ) : (
              "Loading..."
            )}
          </div>
          <div onClick={handleLogOut} className="space-x-4 bg-amber-800 text-white px-4 py-2 rounded-full hover:bg-amber-600">
            <button>Logout</button>
          </div>
        </div>
      </div>
        {/* chat area */}
      <div className="flex-grow p-6 border-2 border-amber-500 rounded-lg m-4 bg-white shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-700 mt-10">Chat Area</h1>
        <p className="text-center text-gray-600 mt-4">This is where the chat interface will be implemented.</p>
      </div>
    </div>
  );
}
