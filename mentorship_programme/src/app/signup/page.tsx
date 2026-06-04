"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, AlertCircle, Mail } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // If already authenticated, redirect to dashboard.
  // Uses getUser() instead of getSession() to avoid stale-cookie issues.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push("/dashboard");
    }).catch(() => {/* not logged in */});
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      // Create profile via API route (uses service-role key, bypasses RLS).
      await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.session.user.id,
          full_name: fullName,
          email,
        }),
      }).catch(() => {});

      // Full page navigation ensures cookies are fresh for server
      // components on the dashboard.
      window.location.href = "/dashboard";
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="card max-w-md w-full text-center">
          <Mail className="mx-auto text-qosf-blue mb-4" size={48} />
          <h1 className="text-2xl font-bold text-qosf-blue mb-2">Check Your Email</h1>
          <p className="text-qosf-text-light mb-6">
            We sent a confirmation link to <strong>{email}</strong>.
            Please click the link to verify your account, then sign in.
          </p>
          <Link href="/login" className="btn-secondary">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <UserPlus className="mx-auto text-qosf-blue mb-3" size={40} />
          <h1 className="text-2xl font-bold text-qosf-blue">Create Account</h1>
          <p className="text-qosf-text-light text-sm mt-1">
            Join the QOSF Mentorship Programme
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-qosf-text mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-qosf-border rounded-lg focus:ring-2 focus:ring-qosf-blue focus:border-transparent outline-none"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-qosf-text mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-qosf-border rounded-lg focus:ring-2 focus:ring-qosf-blue focus:border-transparent outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-qosf-text mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-qosf-border rounded-lg focus:ring-2 focus:ring-qosf-blue focus:border-transparent outline-none"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-secondary w-full justify-center disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-qosf-text-light mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-qosf-blue font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
