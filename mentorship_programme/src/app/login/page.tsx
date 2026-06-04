"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setError(null);
    alert("Check your email for the magic link!");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <LogIn className="mx-auto text-qosf-blue mb-3" size={40} />
          <h1 className="text-2xl font-bold text-qosf-blue">Sign In</h1>
          <p className="text-qosf-text-light text-sm mt-1">
            Welcome back to the QOSF Mentorship Programme
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-qosf-text mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-qosf-text-light" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-qosf-border rounded-lg focus:ring-2 focus:ring-qosf-blue focus:border-transparent outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-qosf-text mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-qosf-text-light" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-qosf-border rounded-lg focus:ring-2 focus:ring-qosf-blue focus:border-transparent outline-none"
                placeholder="Your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-secondary w-full justify-center disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2">
          <hr className="flex-1 border-qosf-border" />
          <span className="text-sm text-qosf-text-light">or</span>
          <hr className="flex-1 border-qosf-border" />
        </div>

        <button
          onClick={handleMagicLink}
          disabled={loading}
          className="btn-outline w-full justify-center disabled:opacity-50"
        >
          Send Magic Link
        </button>

        <p className="text-center text-sm text-qosf-text-light mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-qosf-blue font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}