"use client";
import { useState } from "react";
import { IoMdEyeOff, IoMdEye } from "react-icons/io";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { NextResponse } from "next/server";


export default function page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/chat');
    }

  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      });
      if (error) console.error("Error:", error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="w-full max-w-md rounded-3xl bg-white/70 p-10 shadow-2xl backdrop-blur-lg">
        {/* Header */}
        <h2 className="mb-2 text-center text-3xl font-extrabold text-gray-800">
          Welcome Back
        </h2>
        <p className="mb-8 text-center text-sm text-gray-500">
          Please login to your account
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-sm shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200"
              />

              {/* Eye icon */}
              <div
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
              >
                {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        {/* sign with google */}
        <div>
         <button onClick={handleGoogleLogin}>
           Sign in with Google
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/register" className="font-medium text-purple-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
