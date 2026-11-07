"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions/adminAuth";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);

    if (res.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(res.error || "Authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07090E] p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0E1118] p-8 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676]">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>

        <h1 className="text-center text-xl font-black uppercase tracking-tight text-white">
          Meda Plus + Command Center
        </h1>
        <p className="mt-1 text-center text-xs text-neutral-400">
          Enter your Master Admin Key to access broadcast telemetry and stream switches.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Master Passphrase
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
              <input
                type="password"
                name="secretKey"
                required
                placeholder="••••••••••••••••"
                className="w-full rounded-xl border border-neutral-800 bg-[#090A0F] py-2.5 pl-10 pr-3 text-sm text-white focus:border-[#00E676] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00E676] py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#00c967] disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Enter Portal"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}