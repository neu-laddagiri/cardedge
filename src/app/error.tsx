"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    track("application_error", { digest: error.digest ?? "unknown" });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-md rounded-2xl p-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-wider text-red-400">Unexpected error</p>
        <h1 className="mb-3 text-2xl font-bold text-zinc-100">The table needs a reset</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Your locally saved history is still available. Retry the current view to continue.
        </p>
        <Button onClick={unstable_retry}>Retry</Button>
      </div>
    </main>
  );
}
