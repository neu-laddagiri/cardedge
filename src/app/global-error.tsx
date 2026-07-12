"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    track("global_application_error", { digest: error.digest ?? "unknown" });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#050807] px-4 text-zinc-100">
        <main className="max-w-md text-center">
          <p className="text-sm text-red-400">CardEdge encountered an unexpected error.</p>
          <h1 className="mt-2 text-3xl font-bold">Your saved training data is safe</h1>
          <p className="mt-3 text-sm text-zinc-400">Retry the application to restore the table.</p>
          <button
            type="button"
            onClick={unstable_retry}
            className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            Retry CardEdge
          </button>
        </main>
      </body>
    </html>
  );
}
