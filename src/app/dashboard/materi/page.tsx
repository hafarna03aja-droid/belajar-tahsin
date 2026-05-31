"use client";

import Link from "next/link";

import { useState, useEffect } from "react";

const catStaticMetadata: Record<string, { color: string; badge: string; desc: string; icon: string }> = {
  hijaiyah: {
    icon: "أ",
    color: "from-green-600/20 to-green-800/10 border-green-500/30",
    badge: "badge-success",
    desc: "Mengenal dan melafalkan huruf-huruf Arab dengan benar",
  },
  tahsin: {
    icon: "📝",
    color: "from-blue-600/20 to-blue-800/10 border-blue-500/30",
    badge: "badge-blue",
    desc: "Perbaikan bacaan dan pengucapan secara bertahap",
  },
  tajwid: {
    icon: "🎓",
    color: "from-purple-600/20 to-purple-800/10 border-purple-500/30",
    badge: "badge-warning",
    desc: "Hukum-hukum bacaan Al-Qur'an secara mendalam",
  },
};

export default function MateriPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredMateri, setFeaturedMateri] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/materi")
      .then((r) => r.json())
      .then((data) => {
        if (data?.categories) {
          const mapped = data.categories.map((c: any) => {
            const meta = catStaticMetadata[c.id] || {
              icon: c.icon ?? "📚",
              color: "from-slate-600/20 to-slate-800/10 border-slate-500/30",
              badge: "badge-blue",
              desc: c.desc ?? "Materi belajar Al-Qur'an",
            };
            return {
              ...c,
              ...meta,
              level: c.level.charAt(0).toUpperCase() + c.level.slice(1),
            };
          });
          setCategories(mapped);

          // Flatten and map suggestions
          const allMateri = data.categories.flatMap((cat: any) =>
            cat.materi.map((m: any) => {
              // Extract Arabic letter or symbol as icon
              let icon = "📖";
              if (m.judul.includes("(")) {
                const match = m.judul.match(/\(([^)]+)\)/);
                if (match) icon = match[1];
              } else if (cat.id === "tahsin") {
                icon = "📍";
              } else if (cat.id === "tajwid") {
                icon = "ن";
              }

              return {
                id: m.id,
                judul: m.judul,
                kategori: cat.nama,
                kategoriSlug: cat.id,
                durasi: "2 menit", // static duration
                status: m.status,
                icon,
              };
            })
          );

          // Get first 4 suggested materials
          const suggested = allMateri
            .filter((m: any) => m.status !== "terkunci")
            .slice(0, 4);
          setFeaturedMateri(suggested);
        }
      })
      .catch((err) => console.error("Error loading materials:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 pt-8 space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Materi Belajar</h1>
        <p className="text-sm text-slate-400 mt-2">Pilih silabus sesuai levelmu</p>
      </div>

      {/* Category Cards */}
      <div className="space-y-4">
        {categories.map((k, i) => {
          const pct = k.totalMateri > 0 ? Math.round((k.selesai / k.totalMateri) * 100) : 0;
          return (
            <Link
              key={k.id}
              href={`/dashboard/materi/${k.id}`}
              id={`kategori-${k.id}`}
              className={`glass-card glass-card-hover border bg-gradient-to-br ${k.color} p-6 block animate-fade-in-up stagger-${i + 1}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl font-arabic flex-shrink-0">
                  {k.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-100">{k.nama}</span>
                    <span className={`badge ${k.badge}`}>{k.level}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{k.desc}</p>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar flex-1">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {k.selesai}/{k.totalMateri}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Suggested Materi */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Disarankan</h2>
        </div>
        <div className="space-y-3">
          {featuredMateri.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/materi/${m.kategoriSlug}/${m.id}`}
              className={`glass-card glass-card-hover p-5 flex items-center gap-4 ${m.status === "terkunci" ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-arabic text-xl flex-shrink-0">
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{m.judul}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">{m.kategori}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-500">🎬 {m.durasi}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {m.status === "lulus" && <span className="text-brand-400 text-sm">✅</span>}
                {m.status === "dalam_proses" && <span className="badge badge-blue">Lanjut</span>}
                {m.status === "belum" && <span className="badge badge-success">Mulai</span>}
                {m.status === "terkunci" && <span className="text-slate-600 text-sm">🔒</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
