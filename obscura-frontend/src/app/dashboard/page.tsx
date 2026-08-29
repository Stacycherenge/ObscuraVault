"use client";

import React, { useEffect, useState } from "react";
import { useVault } from "@/context/Vaultcontext";
import { decryptSecret } from "@/utils/crypto";
import { api } from "@/utils/api";
import AddSecretModal from "@/components/AddSecretModal";
import VaultTable, { DecryptedVaultItem } from "@/components/VaultTable";

interface EncryptedVaultItem {
  id: number;
  account_title: string;
  encrypted_username: string;
  encrypted_password: string;
  iv: string;
}

export default function DashboardPage() {
  const { masterKey, userEmail, clearVaultSession } = useVault();
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndDecryptVault = async () => {
    if (!masterKey) return;
    setLoading(true);
    setError(null);

    try {
      const encryptedData: EncryptedVaultItem[] = await api.get("/vault/");

      const decryptedData = await Promise.all(
        encryptedData.map(async (item) => {
          try {
            const clearUsername = await decryptSecret(item.encrypted_username, item.iv, masterKey);
            const clearPassword = await decryptSecret(item.encrypted_password, item.iv, masterKey);
            
            return {
              id: item.id,
              account_title: item.account_title,
              username: clearUsername,
              password: clearPassword,
            };
          } catch (decryptionError) {
            return {
              id: item.id,
              account_title: `${item.account_title} (Decryption Corrupted)`,
              username: "[Undecryptable]",
              password: "[Undecryptable]",
            };
          }
        })
      );

      setItems(decryptedData);
    } catch (err: any) {
      console.error("Dashboard synchronization error:", err);
      setError("Failed to fetch vault items from the remote storage array.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndDecryptVault();
  }, [masterKey]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      clearVaultSession(); 
    }
  };

  if (!masterKey) return null;
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-white selection:text-zinc-950">
      <nav className="border-b border-zinc-900 bg-zinc-900/20 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold tracking-tight text-white uppercase text-sm">Obscura Fortress Workspace</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-zinc-400 font-mono">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-zinc-700 hover:text-white transition"
          >
            Destroy Session (Logout)
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Your Credentials</h1>
            <p className="text-sm text-zinc-500">All data blocks below are decrypted locally inside browser RAM runtime parameters.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition shadow-lg"
          >
            + Add New Secret
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-sm text-zinc-600 font-mono tracking-widest animate-pulse">
            Executing Local Decryption Matrix Loop...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/10">
            <p className="text-sm text-zinc-500 font-medium">Vault environment is empty.</p>
          </div>
        ) : (
          <VaultTable items={items} />
        )}
      </main>

      {isModalOpen && (
        <AddSecretModal 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={fetchAndDecryptVault} 
        />
      )}
    </div>
  );
}
