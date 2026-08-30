"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deriveKeys } from "@/utils/crypto";

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
      const { authPasswordHex } = await deriveKeys(password, email);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          auth_password: authPasswordHex,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Registration request rejected by the security container.");
      }

      // Route smoothly into the sign-in portal on success
      router.push("/login");
    } catch (err: any) {
      console.error("Registration boundary execution failure:", err);
      setError(err.message || "An unexpected error occurred during profile creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-fortress-bg px-4 text-fortress-text transition-colors duration-200">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-fortress-border bg-fortress-card p-8 shadow-2xl backdrop-blur-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-fortress-text">Create Account</h1>
          <p className="text-sm text-fortress-muted">Initialize your secure Zero-Knowledge storage profile</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-fortress-muted">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full rounded-lg border border-fortress-border bg-fortress-bg px-4 py-2.5 text-fortress-text placeholder-fortress-muted/40 outline-none transition focus:border-fortress-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-fortress-muted">Master Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-fortress-border bg-fortress-bg px-4 py-2.5 text-fortress-text placeholder-fortress-muted/40 outline-none transition focus:border-fortress-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-fortress-muted">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-fortress-border bg-fortress-bg px-4 py-2.5 text-fortress-text placeholder-fortress-muted/40 outline-none transition focus:border-fortress-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-fortress-accent py-3 font-semibold text-white outline-none transition hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-lg shadow-fortress-accent/20"
          >
            {loading ? "Computing Cryptographic Hashes..." : "Register Vault Securely"}
          </button>
        </form>

        <div className="text-center text-sm text-fortress-muted">
          Already have an operational Vault Account?{" "}
          <Link href="/login" className="font-medium text-fortress-text hover:text-fortress-accent underline underline-offset-4 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
