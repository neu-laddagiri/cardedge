import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { CasinoShell } from "@/components/layout/CasinoShell";

export const metadata: Metadata = { title: "Reset Password | CardEdge" };

export default function ResetPasswordPage() {
  return (
    <CasinoShell>
      <div className="mobile-page flex min-h-[70svh] items-center justify-center">
        <div className="w-full max-w-md"><ResetPasswordForm /></div>
      </div>
    </CasinoShell>
  );
}
