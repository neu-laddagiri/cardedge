import { AuthForm } from "@/components/auth/AuthForm";
import { CasinoShell } from "@/components/layout/CasinoShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | CardEdge",
  description: "Sign in to sync CardEdge results and training history.",
};

export default function LoginPage() {
  return (
    <CasinoShell>
      <div className="mobile-page flex min-h-[70svh] items-center justify-center">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </CasinoShell>
  );
}
