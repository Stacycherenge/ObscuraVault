"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-fortress-bg text-fortress-text selection:bg-fortress-accent selection:text-white transition-colors duration-200">
      {/* Decorative Top Accent Border */}
      <div className="h-[2px] w-full bg-gradient-to-r from-fortress-bg via-fortress-accent to-fortress-bg" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="w-full max-w-2xl space-y-8 animate-fadeIn">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-fortress-border bg-fortress-card/50 px-3 py-1 text-xs text-fortress-muted backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono tracking-wider uppercase">Zero-Knowledge Sandbox Ready</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Obscura <span className="text-fortress-accent">Vault</span>
            </h1>
            <p className="mx-auto max-w-lg text-base text-fortress-muted sm:text-lg">
              An uncompromising, Secure-by-Design fortress. Your master credentials never touch the internet, encrypted completely within your browser state variables.
            </p>
          </div>

          {/* Action Call To Actions */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="w-full rounded-xl bg-fortress-accent px-8 py-3.5 text-sm font-bold text-white outline-none transition hover:opacity-90 sm:w-auto shadow-lg shadow-fortress-accent/20"
            >
              Unlock Vault Workspace
            </Link>
            <Link
              href="/register"
              className="w-full rounded-xl border border-fortress-border bg-fortress-card/30 px-8 py-3.5 text-sm font-semibold text-fortress-text backdrop-blur-md outline-none transition hover:bg-fortress-card/60 sm:w-auto"
            >
              Initialize Profile
            </Link>
          </div>

          {/* Footer  */}
          <div className="grid grid-cols-1 gap-4 pt-12 text-left sm:grid-cols-3 border-t border-fortress-border max-w-xl mx-auto">
            <div className="space-y-1 p-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-fortress-accent">Client AES-GCM</h3>
              <p className="text-xs text-fortress-muted">Every database record maps an independent random 12-byte IV token tag block.</p>
            </div>
            <div className="space-y-1 p-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-fortress-accent">Asymmetric Token</h3>
              <p className="text-xs text-fortress-muted">Cookies verified using raw RS256 environment configuration signature key blocks.</p>
            </div>
            <div className="space-y-1 p-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-fortress-accent">Stateless Core</h3>
              <p className="text-xs text-fortress-muted">The remote repository functions as blind storage. Decryption runs locally in memory.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-fortress-muted font-mono select-none border-t border-fortress-border/40">
        Obscura Cryptographic System v1.0.0 // Protected Framework Perimeter
      </footer>
    </div>
  );
}
