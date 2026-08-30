"use client";

import React, { useState } from "react";
import { useVault } from "@/context/Vaultcontext";
import { encryptSecret } from "@/utils/crypto";

interface AddSecretModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export default function AddSecretModal({ onClose, onRefresh }: AddSecretModalProps) {
  const { masterKey } = useVault();
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKey) return;
    setError(null);
    setLoading(true);

    try {
      const encryptedUser = await encryptSecret(username, masterKey);
      const encryptedPass = await encryptSecret(password, masterKey);

      const response = await fetch("/api/vault/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_title: title,
          encrypted_username: encryptedUser.ciphertext,
          encrypted_password: encryptedPass.ciphertext,
          iv: encryptedUser.iv,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Server rejected secure credentials persistence request.");
      }

      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Cryptographic processing failure:", err);
      setError(err.message || "Failed to encrypt data fields locally before storage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-fortress-border bg-fortress-card p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-fortress-border pb-3">
          <h3 className="text-lg font-bold text-fortress-text">Add New Secret</h3>
          <button onClick={onClose} className="text-fortress-muted hover:text-fortress-text transition-colors font-mono text-xs cursor-pointer">
            [ESC]
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-fortress-muted">Platform Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Google, GitHub, AWS Profile"
              className="w-full rounded-lg border border-fortress-border bg-fortress-bg px-4 py-2 text-fortress-text placeholder-fortress-muted/40 outline-none transition focus:border-fortress-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-fortress-muted">Account Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex_dev"
              className="w-full rounded-lg border border-fortress-border bg-fortress-bg px-4 py-2 text-fortress-text placeholder-fortress-muted/40 outline-none transition focus:border-fortress-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-fortress-muted">Target Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-fortress-border bg-fortress-bg px-4 py-2 text-fortress-text placeholder-fortress-muted/40 outline-none transition focus:border-fortress-accent"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-lg border border-fortress-border py-2.5 text-sm font-semibold text-fortress-muted hover:bg-fortress-bg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 rounded-lg bg-fortress-accent py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-lg shadow-fortress-accent/20"
            >
              {loading ? "AES Encryption Loop..." : "Encrypt & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
