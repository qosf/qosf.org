"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock, AlertCircle, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"request" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When the user arrives via a password-recovery link, Supabase
    // consumes the URL hash and emits a PASSWORD_RECOVERY event.
    // We listen for that event and switch to the reset-password form.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setMode("reset");
        }
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` },
    );

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setMode("done");
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.updateUser({
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

  if (mode === "done") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="card max-w-md w-full text-center">
          <Mail className="mx-auto text-green-600 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-qosf-blue mb-2">Check Your Email</h1>
          <p className="text-qosf-text-light">
            If an account exists for <strong>{email}</strong>, you will receive
            a password reset link shortly.
          </p>
          <Link href="/login" className="btn-secondary mt-6 inline-block">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        {mode === "request" ? (
          <>
            <div className="text-center mb-8">
              <Lock className="mx-auto text-qosf-blue mb-3" size={40} />
              <h1 className="text-2xl font-bold text-qosf-blue">Reset Password</h1>
              <p className="text-qosf-text-light text-sm mt-1">
                Enter your email and we&apos;ll send you a recovery link
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-qosf-text mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-qosf-text-light" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-qosf-border rounded-lg focus:ring-2 focus:ring-qosf-blue focus:border-transparent outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-secondary w-full justify-center disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Recovery Link"}
              </button>
            </form>

            <p className="text-center text-sm text-qosf-text-light mt-6">
              <Link href="/login" className="text-qosf-blue hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <Lock className="mx-auto text-qosf-blue mb-3" size={40} />
              <h1 className="text-2xl font-bold text-qosf-blue">Set New Password</h1>
              <p className="text-qosf-text-light text-sm mt-1">
                Choose a new password for your account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-qosf-text mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-qosf-text-light" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-qosf-border rounded-lg focus:ring-2 focus:ring-qosf-blue focus:border-transparent outline-none"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-qosf-text-light hover:text-qosf-blue"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-secondary w-full justify-center disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
