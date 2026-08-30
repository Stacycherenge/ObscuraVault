"use client";

import React, { useState } from "react";

export interface DecryptedVaultItem {
  id: number;
  account_title: string;
  username: string;
  password: string;
}

interface VaultTableProps {
  items: DecryptedVaultItem[];
}

export default function VaultTable({ items }: VaultTableProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-fortress-border bg-fortress-card shadow-sm transition-all duration-200">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-fortress-border bg-fortress-bg/40 text-fortress-muted text-xs font-semibold uppercase tracking-wider">
            <th className="px-6 py-4">Account Platform</th>
            <th className="px-6 py-4">Username ID</th>
            <th className="px-6 py-4 text-right">Decrypted Secret Key</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-fortress-border text-fortress-text">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-fortress-bg/20 transition-colors">
              <td className="px-6 py-4 font-semibold text-fortress-text">
                {item.account_title}
              </td>
              <td className="px-6 py-4 font-mono text-fortress-text/90 selection:bg-fortress-accent/20">
                {item.username}
              </td>
              <td className="px-6 py-4 text-right font-mono">
                <div className="flex items-center justify-end space-x-3">
                  <span 
                    className={`font-mono transition-all duration-200 select-all selection:bg-fortress-accent/20 ${
                      visiblePasswords[item.id] 
                        ? "text-fortress-accent font-bold tracking-normal" 
                        : "text-fortress-muted/50 tracking-widest font-sans"
                    }`}
                  >
                    {visiblePasswords[item.id] ? item.password : "••••••••••••"}
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(item.id)}
                    type="button"
                    className="rounded-md border border-fortress-border bg-fortress-card px-2 py-1 text-xs font-medium text-fortress-text hover:bg-fortress-bg transition-colors"
                  >
                    {visiblePasswords[item.id] ? "Hide" : "Show"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
