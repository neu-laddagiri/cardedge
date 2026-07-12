"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/Button";

type Mode = "sign-in" | "sign-up" | "recover";

export function AuthForm() {
  const { configured, supabase } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setPending(true);
    setError(null);
    setMessage(null);

    if (mode === "recover") {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (authError) setError(authError.message);
      else setMessage("Check your email for a secure password-reset link.");
      setPending(false);
      return;
    }

    const result =
      mode === "sign-up"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(result.error.message);
      setPending(false);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage("Account created. Check your email to confirm it, then sign in.");
      setPending(false);
      return;
    }

    router.replace("/account");
    router.refresh();
  };

  if (!configured) {
    return (
      <div className="mobile-card p-5 text-center">
        <LockKeyhole className="mx-auto mb-3 h-7 w-7 text-emerald-400" />
        <h1 className="text-xl font-semibold text-zinc-100">Account sync is being connected</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          CardEdge still saves everything privately on this phone. Cloud accounts will appear here as soon as the secure database connection is enabled.
        </p>
      </div>
    );
  }

  return (
    <div className="mobile-card p-5">
      {mode === "recover" && (
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-zinc-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </button>
      )}
      <div className="mb-5">
        <p className="eyebrow">CardEdge account</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-100">
          {mode === "sign-in" ? "Welcome back" : mode === "sign-up" ? "Create your account" : "Reset password"}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {mode === "recover"
            ? "We’ll send a secure reset link to your email."
            : "Sync bankroll sessions and saved training hands across devices."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm text-zinc-300">
          Email
          <span className="relative mt-1.5 block">
            <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mobile-input pl-10"
              placeholder="you@example.com"
            />
          </span>
        </label>
        {mode !== "recover" && (
          <label className="block text-sm text-zinc-300">
            Password
            <span className="relative mt-1.5 block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
              <input
                required
                type="password"
                minLength={8}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mobile-input pl-10"
                placeholder="At least 8 characters"
              />
            </span>
          </label>
        )}

        {error && <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        {message && <p role="status" className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Please wait…" : mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : "Send reset link"}
        </Button>
      </form>

      {mode !== "recover" && (
        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <button type="button" onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")} className="min-h-11 text-emerald-400">
            {mode === "sign-in" ? "Create account" : "I already have an account"}
          </button>
          {mode === "sign-in" && (
            <button type="button" onClick={() => setMode("recover")} className="min-h-11 text-zinc-400">Forgot password?</button>
          )}
        </div>
      )}
    </div>
  );
}
