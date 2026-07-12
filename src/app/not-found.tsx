import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | CardEdge",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold text-[#c9a84c]">404</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-100">That table does not exist</h1>
        <p className="mt-3 text-zinc-500">Return to CardEdge and start a new training hand.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
          Return home
        </Link>
      </div>
    </main>
  );
}
