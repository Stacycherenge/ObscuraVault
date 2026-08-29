"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
interface VaultContextType {
  masterKey: CryptoKey | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  setVaultSession: (key: CryptoKey, email: string) => void;
  clearVaultSession: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (!masterKey && currentPath === "/dashboard") {
      router.replace("/login");
    }
  }, [masterKey, router]);

 
  const setVaultSession = (key: CryptoKey, email: string) => {
    setMasterKey(key);
    setUserEmail(email);
  };


  const clearVaultSession = () => {
    setMasterKey(null);
    setUserEmail(null);
    router.replace("/login");
  };

  return (
    <VaultContext.Provider
      value={{
        masterKey,
        userEmail,
        isAuthenticated: !!masterKey,
        setVaultSession,
        clearVaultSession,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}


export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be executed inside a valid VaultProvider layout container.");
  }
  return context;
}
