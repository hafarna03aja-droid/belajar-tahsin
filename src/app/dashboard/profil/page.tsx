"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useState } from "react";

const menuItems = [
  { icon: "🔔", label: "Notifikasi", href: "#" },
  { icon: "🔒", label: "Ubah Password", href: "#" },
  { icon: "🌙", label: "Preferensi", href: "#" },
  { icon: "❓", label: "Bantuan & FAQ", href: "#" },
  { icon: "📋", label: "Syarat & Ketentuan", href: "#" },
];

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<{
    points: number;
    streak: number;
    level: string;
    completedMateriCount: number;
    submissionCount: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/stats")
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) {
            setStats(data);
          }
        })
        .catch((err) => console.error("Error loading profile stats:", err))
        .finally(() => setLoadingStats(false));
    }
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && loadingStats)) {
    return (
      <div className="p-4 pt-8 space-y-4 animate-fade-in">
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="skeleton h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!session) return null;
  const user = session.user;

  const points = stats?.points ?? user.points ?? 0;
  const streak = stats?.streak ?? user.streak ?? 0;
  const level = stats?.level ?? user.level ?? "dasar";
  const completedMateri = stats?.completedMateriCount ?? 0;
  const submissions = stats?.submissionCount ?? 0;

  const achievements = [
    { icon: "🌟", nama: "Permulaan Mulia", desc: "Menyelesaikan materi pertama", unlocked: completedMateri >= 1 },
    { icon: "🔥", nama: "Streak Belajar", desc: "Memiliki streak belajar aktif", unlocked: streak > 0 },
    { icon: "📖", nama: "Hafidz Pemula", desc: "Menyetorkan ayat ke Ustadz", unlocked: submissions >= 1 },
    { icon: "🏆", nama: "Tajwid Master", desc: "Mendapatkan 1,500+ Poin XP", unlocked: points >= 1500 },
  ];

  return (
    <div className="px-4 pt-10 pb-6 space-y-7 animate-fade-in">
      {/* Profile Card */}
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/8 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-brand-600/30 border-2 border-brand-500/50 flex items-center justify-center text-5xl mx-auto mb-4 animate-float">
            🧑‍🎓
          </div>
          <h1 className="text-xl font-bold text-slate-100">{user.name ?? "Pengguna"}</h1>
          <p className="text-base text-slate-400 mt-1">{user.email}</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="badge badge-success capitalize">{level}</span>
            <div className="streak-badge">🔥 {streak} hari</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Poin", value: points.toLocaleString(), icon: "⭐" },
          { label: "Materi Selesai", value: String(completedMateri), icon: "📚" },
          { label: "Setoran", value: String(submissions), icon: "🎙️" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-lg font-bold gradient-text">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Pencapaian</h2>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((a) => (
            <div
              key={a.nama}
              className={`glass-card p-5 flex items-start gap-4 ${!a.unlocked ? "opacity-30" : ""}`}
            >
              <span className="text-2xl flex-shrink-0">{a.icon}</span>
              <div>
                <p className="text-xs font-semibold text-slate-200 leading-snug">{a.nama}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="glass-card divide-y divide-white/5">
        {menuItems.map((m) => (
          <a
            key={m.label}
            href={m.href}
            className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-slate-300 hover:text-slate-100"
          >
            <span className="text-lg w-6 text-center">{m.icon}</span>
            <span className="text-sm flex-1">{m.label}</span>
            <span className="text-slate-600 text-sm">›</span>
          </a>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-colors"
      >
        Keluar dari Akun
      </button>
    </div>
  );
}
