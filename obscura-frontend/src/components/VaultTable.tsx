"use client";

import React from "react";

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
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-900/20">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <th className="px-6 py-4">Account Platform</th>
            <th className="px-6 py-4">Username ID</th>
            <th className="px-6 py-4">Decrypted Secret Key</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-zinc-900/40 transition">
              <td className="px-6 py-4 font-semibold text-white">{item.account_title}</td>
              <td className="px-6 py-4 text-zinc-300 font-mono">{item.username}</td>
              <td className="px-6 py-4 text-zinc-300 font-mono">
                <input
                  type="password"
                  readOnly
                  value={item.password}
                  onClick={(e) => {
                    e.currentTarget.type = e.currentTarget.type === "password" ? "text" : "password";
                  }}
                  className="bg-transparent border-none outline-none cursor-pointer text-emerald-400 font-mono select-none"
                  title="Click to toggle visibility option"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
