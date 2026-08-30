"use client";

import React from "react";
import { useVault } from "@/context/Vaultcontext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useVault();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="rounded-lg border border-fortress-border bg-fortress-card px-3 py-1.5 text-xs font-semibold text-fortress-text transition-all hover:bg-fortress-bg cursor-pointer shadow-sm"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
    >
      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
