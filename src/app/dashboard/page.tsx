"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const quickActions = [
  { icon: "🤖", label: "Latihan AI", href: "/dashboard/latihan-ai", color: "bg-brand-600/20 border-brand-500/30" },
  { icon: "📚", label: "Lanjut Materi", href: "/dashboard/materi", color: "bg-blue-600/20 border-blue-500/30" },
  { icon: "📖", label: "Al-Qur'an", href: "/dashboard/quran", color: "bg-purple-600/20 border-purple-500/30" },
  { icon: "🎙️", label: "Setor Ayat", href: "/dashboard/setor", color: "bg-gold-500/10 border-gold-500/30" },
];

import { useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<{
    points: number;
    streak: number;
    level: string;
    completedMateriCount: number;
    submissionCount: number;
  } | null>(null);
  const [recentMateri, setRecentMateri] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role === "ustadz") {
        router.push("/dashboard/ustadz");
        return;
      }

      Promise.all([
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/materi").then((r) => r.json()),
      ])
        .then(([statsData, materiData]) => {
          if (statsData && !statsData.error) {
            setStats(statsData);
          }
          if (materiData?.categories) {
            const allMateri = materiData.categories.flatMap((cat: any) =>
              cat.materi.map((m: any) => ({
                id: m.id,
                judul: m.judul,
                kategori: cat.nama,
                status: m.status,
                progress: m.status === "lulus" ? 100 : m.status === "dalam_proses" ? 50 : 0,
                kategoriSlug: cat.id,
              }))
            );
            // Get up to 3 materials that are not locked
            const filtered = allMateri
              .filter((m: any) => m.status !== "terkunci")
              .slice(0, 3);
            setRecentMateri(filtered);
          }
        })
        .catch((err) => console.error("Error fetching dashboard data:", err))
        .finally(() => setDataLoading(false));
    }
  }, [status, session, router]);

  if (status === "loading" || (status === "authenticated" && dataLoading)) {
    return (
      <div className="p-4 pt-8 space-y-4">
        <div className="skeleton h-28 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!session) return null;
  const user = session.user;

  const points = stats?.points ?? user.points ?? 0;
  const streak = stats?.streak ?? user.streak ?? 0;
  const level = stats?.level ?? user.level ?? "dasar";
  const completedCount = stats?.completedMateriCount ?? 0;
  const totalCount = 5; // default dynamic total based on seed
  const pct = Math.min(Math.round((completedCount / totalCount) * 100), 100);

  // Level progression labels
  const levelOrder = ["dasar", "menengah", "mahir"];
  const levelIdx = levelOrder.indexOf(level.toLowerCase());
  const nextLevel = levelOrder[levelIdx + 1] ?? null;
  const levelIcon = level.toLowerCase() === "dasar" ? "🌱" : level.toLowerCase() === "menengah" ? "📖" : "🏆";

  return (
    <div className="space-y-8 animate-fade-in pt-4">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Assalamu&apos;alaikum,</p>
          <h1 className="text-xl font-bold text-slate-100">{user.name ?? user.email}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="streak-badge">
            🔥 {streak}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
            aria-label="Keluar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── PROGRESS CARD ─── */}
      <div className="glass-card p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          {/* Level */}
          <div className="flex items-center gap-4 sm:min-w-[140px]">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-2xl flex-shrink-0">
              {levelIcon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Level Saat Ini</p>
              <p className="text-xl font-black text-white capitalize mt-0.5">{level}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1">
              <span>{completedCount} dari {totalCount} materi selesai</span>
              <span className="font-bold text-brand-400">{pct}%</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">
              {nextLevel
                ? `Selesaikan lebih banyak materi untuk mencapai level ${nextLevel}`
                : "🏆 Anda telah mencapai level tertinggi!"}
            </p>
          </div>

          {/* Points */}
          <div className="flex items-center gap-4 sm:min-w-[120px] sm:justify-end">
            <div className="text-center sm:text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Poin</p>
              <p className="text-2xl font-black text-amber-500 mt-0.5">{points.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl flex-shrink-0">⭐</div>
          </div>

        </div>
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {quickActions.map((a, i) => (
            <Link
              key={a.label}
              href={a.href}
              id={`quick-action-${i}`}
              className={`glass-card glass-card-hover border ${a.color} p-6 flex flex-col items-center justify-center text-center gap-4 animate-fade-in-up stagger-${i + 1}`}
            >
              <span className="text-2xl leading-none">{a.icon}</span>
              <span className="text-sm font-semibold text-slate-200">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── RECENT MATERI ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Materi Terkini</h2>
          <Link href="/dashboard/materi" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Lihat semua →
          </Link>
        </div>
        <div className="space-y-4">
          {recentMateri.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/materi/${m.kategoriSlug}/${m.id}`}
              className="glass-card glass-card-hover p-6 flex items-center gap-5 w-full"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                m.status === "lulus" ? "bg-brand-600/20" :
                m.status === "dalam_proses" ? "bg-blue-600/20" : "bg-slate-700/50"
              }`}>
                {m.status === "lulus" ? "✅" : m.status === "dalam_proses" ? "📖" : "🔒"}
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <p className={`text-base font-semibold truncate ${m.status === "terkunci" ? "text-slate-500" : "text-slate-200"}`}>
                  {m.judul}
                </p>
                <div className="flex items-center gap-3">
                  <span className="badge badge-blue text-[11px] py-1 px-2.5">{m.kategori}</span>
                  <div className="progress-bar flex-1 h-2">
                    <div className="progress-fill" style={{ width: `${m.progress}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{m.progress}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── DAILY CHALLENGE ─── */}
      <div className="glass-card p-6 border border-gold-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center text-2xl flex-shrink-0 animate-float">
            ⭐
          </div>
          <div className="flex-1">
            <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider mb-0.5">Tantangan Hari Ini</p>
            <p className="text-sm text-slate-200 font-medium">Baca Surah Al-Fatihah dengan AI</p>
            <p className="text-xs text-slate-500 mt-0.5">Selesaikan untuk +50 poin</p>
          </div>
          <Link href="/dashboard/latihan-ai" className="btn-brand text-xs py-2 px-3 flex-shrink-0">
            Mulai
          </Link>
        </div>
      </div>
    </div>
  );
}
