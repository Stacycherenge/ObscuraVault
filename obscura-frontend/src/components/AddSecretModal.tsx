    "use client";

import React, { useState } from "react";
import { useVault } from "@/context/Vaultcontext";
import { encryptSecret } from "@/utils/crypto";
import { api } from "@/utils/api";

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

      await api.post("/vault/", {
        account_title: title,
        encrypted_username: encryptedUser.ciphertext,
        encrypted_password: encryptedPass.ciphertext,
        iv: encryptedUser.iv, 
      });

      onRefresh(); 
      onClose(); 
    } catch (err: any) {
      console.error("Cryptographic processing failure:", err);
      setError("Failed to encrypt data fields block locally before delivery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-white">Add New Secret Block</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition font-mono text-sm outline-none">
            [ESC]
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Platform Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Google, GitHub, AWS Profile"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 placeholder-zinc-700 outline-none transition focus:border-zinc-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Account Identity / Email</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex_dev"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 placeholder-zinc-700 outline-none transition focus:border-zinc-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Plaintext Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 placeholder-zinc-700 outline-none transition focus:border-zinc-700"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-lg border border-zinc-800 py-2.5 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 rounded-lg bg-white py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? "AES Encryption Loop..." : "Encrypt & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
