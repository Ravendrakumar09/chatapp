"use client";
import { useState } from "react";
import { IoMdEyeOff, IoMdEye } from "react-icons/io";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';

export default function page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError("");
      alert("Registration successful! Please check your email to confirm your account.");
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100">
      <div className="w-full max-w-md rounded-3xl bg-white/70 p-10 shadow-2xl backdrop-blur-lg">
        {/* Header */}
        <h2 className="mb-2 text-center text-3xl font-extrabold text-gray-800">
          Create Account
        </h2>
        <p className="mb-8 text-center text-sm text-gray-500">
          Sign up to get started
        </p>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200"
            />
          </div>

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
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}  // 👈 conditionally show/hide
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200"
            />

            {/* Eye icon for show/hide password */}
            <div
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-5 top-11 cursor-pointer text-gray-400"
            >
              {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-pink-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
