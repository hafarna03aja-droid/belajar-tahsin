"use client";

import Link from "next/link";

export function MobileHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3.5 bg-surface-950/85 backdrop-blur-lg border-b border-white/5 md:hidden">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold group">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
            🕌
          </div>
          <span className="gradient-text text-base font-extrabold tracking-tight">QuranEdutech</span>
        </Link>
        <Link
          href="/dashboard/profil"
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/30 flex items-center justify-center transition-all active:scale-95"
          aria-label="Profil"
        >
          <span className="text-base">👤</span>
        </Link>
      </div>
    </header>
  );
}

