"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVault } from "@/context/Vaultcontext";
import { deriveKeys } from "@/utils/crypto";
import { api } from "@/utils/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { setVaultSession } = useVault();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { masterKey, authPasswordHex } = await deriveKeys(password, email);

      await api.post("/auth/login", {
        email: email,
        auth_password: authPasswordHex,
      });

      setVaultSession(masterKey, email);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Authentication boundary execution failure:", err);
      setError(err.message || "Invalid credentials or communication failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-50">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-md shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Obscura Vault</h1>
          <p className="text-sm text-zinc-400">Unlock your decentralized cryptographic fortress</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Master Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 font-semibold text-zinc-950 outline-none transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Decrypting Session Keys..." : "Unlock Secure Vault"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500">
          New to the platform?{" "}
          <Link href="/register" className="font-medium text-zinc-300 hover:text-white underline underline-offset-4">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
