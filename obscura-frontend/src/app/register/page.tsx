"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deriveKeys } from "@/utils/crypto";
import { api } from "@/utils/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Structural Boundary Checks
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 12) {
      setError("Master Password must be at least 12 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 2. Client-Side Cryptographic Stretching Loop (Zero Knowledge)
      // Uses email as salt. Computes 100,000 PBKDF2 hashing rounds inside RAM.
      const { authPasswordHex } = await deriveKeys(password, email);

      // 3. Payload Isolation Transport
      // We explicitly DO NOT send the raw master password string. 
      // We only send the derived server auth hex token.
      await api.post("/auth/signup", {
        email: email,
        auth_password: authPasswordHex,
      });

      // Account verification successful, route to login gateway
      router.push("/login");
    } catch (err: any) {
      console.error("Registration boundary execution failure:", err);
      setError(err.message || "An unexpected error occurred during profile creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-50">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-md shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-sm text-zinc-400">Initialize your secure Zero-Knowledge storage profile</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 font-semibold text-zinc-950 outline-none transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Computing Cryptographic Hashes..." : "Register Vault Securely"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500">
          Already have an operational vault?{" "}
          <Link href="/login" className="font-medium text-zinc-300 hover:text-white underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
