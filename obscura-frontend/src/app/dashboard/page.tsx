"use client";

import React, { useEffect, useState } from "react";
import { useVault } from "@/context/Vaultcontext";
import { decryptSecret } from "@/utils/crypto";
import AddSecretModal from "@/components/AddSecretModal";
import VaultTable, { DecryptedVaultItem } from "@/components/VaultTable";
import ThemeToggle from "@/components/ThemeToggle";

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
      const response = await fetch("/api/vault/", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vault items from storage cluster.");
      }

      const encryptedData: EncryptedVaultItem[] = await response.json();

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
      console.error("Dashboard sync failure:", err);
      setError(err.message || "Failed to parse remote storage array items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndDecryptVault();
  }, [masterKey]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Proceed with cache destruction regardless of route state
    } finally {
      clearVaultSession();
    }
  };

  if (!masterKey) return null;

  return (
    <div className="min-h-screen bg-fortress-bg text-fortress-text selection:bg-fortress-accent selection:text-white transition-colors duration-200">
      <nav className="border-b border-fortress-border bg-fortress-card/20 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold tracking-tight uppercase text-sm">Obscura Fortress</span>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <span className="text-xs text-fortress-muted font-mono">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-fortress-border bg-fortress-card px-3 py-1.5 text-xs font-semibold text-fortress-text hover:bg-fortress-bg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-end justify-between border-b border-fortress-border pb-5">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight">Your Credentials</h1>
            <p className="text-sm text-fortress-muted">All credentials are decrypted securely inside local browser memory parameters.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-fortress-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-fortress-accent/20"
          >
            + Add New Secret
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/30 bg-red-950/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-sm text-fortress-muted font-mono tracking-widest animate-pulse">
            Executing Local Decryption Matrix Loop...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-fortress-border rounded-2xl bg-fortress-card/10">
            <p className="text-sm text-fortress-muted font-medium">Vault environment is empty.</p>
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
