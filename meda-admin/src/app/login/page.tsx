"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Eye, EyeOff, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: secretKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to connect to authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07080B] p-4 font-sans text-white">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-8 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914] text-white font-black text-lg shadow-[0_0_15px_rgba(229,9,20,0.4)]">
            M+
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-wider text-white">
              Meda Control Deck
            </h1>
            <p className="text-[11px] text-neutral-400">Isolated Management System</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-center text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Passphrase
            </label>
            <div className="relative mt-1">
              <input
                type={showKey ? "text" : "password"}
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter ADMIN_SECRET_KEY"
                className="w-full rounded-xl border border-neutral-800 bg-[#07080B] py-2.5 pl-3.5 pr-10 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Access Control"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}