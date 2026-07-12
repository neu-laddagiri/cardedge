"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const { user, supabase, loading } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !user) return;
    setPending(true);
    setError(null);
    const result = await supabase.auth.updateUser({ password });
    if (result.error) {
      setError(result.error.message);
      setPending(false);
      return;
    }
    router.replace("/account");
    router.refresh();
  };

  return (
    <div className="mobile-card p-5">
      <LockKeyhole className="mb-4 h-7 w-7 text-emerald-400" />
      <p className="eyebrow">Secure account</p>
      <h1 className="mt-1 text-2xl font-bold text-zinc-100">Choose a new password</h1>
      <p className="mt-2 text-sm text-zinc-400">Use at least eight characters.</p>
      {loading ? (
        <p className="mt-5 text-sm text-zinc-500">Verifying your reset link…</p>
      ) : !user ? (
        <p role="alert" className="mt-5 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-200">This reset link is invalid or expired. Request a new one from the sign-in screen.</p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <input
            required
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mobile-input"
            placeholder="New password"
          />
          {error && <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Updating…" : "Update password"}</Button>
        </form>
      )}
    </div>
  );
}
