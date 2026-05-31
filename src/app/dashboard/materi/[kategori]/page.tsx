"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useState, useEffect } from "react";

const catStaticMetadata: Record<
  string,
  { nama: string; icon: string; level: string; desc: string; color: string }
> = {
  hijaiyah: {
    nama: "Hijaiyah",
    icon: "أ",
    level: "Dasar",
    desc: "Mengenal dan melafalkan 29 huruf Arab dengan benar",
    color: "from-green-600/10 to-transparent border-green-500/20",
  },
  tahsin: {
    nama: "Tahsin",
    icon: "📝",
    level: "Menengah",
    desc: "Perbaikan bacaan dan pengucapan secara bertahap",
    color: "from-blue-600/10 to-transparent border-blue-500/20",
  },
  tajwid: {
    nama: "Tajwid",
    icon: "🎓",
    level: "Mahir",
    desc: "Hukum-hukum bacaan Al-Qur'an secara mendalam",
    color: "from-purple-600/10 to-transparent border-purple-500/20",
  },
};

const statusConfig = {
  lulus: { label: "Lulus ✅", className: "badge-success" },
  dalam_proses: { label: "Lanjut →", className: "badge-blue" },
  tersedia: { label: "Mulai", className: "badge-success" },
  terkunci: { label: "🔒", className: "bg-white/5 text-slate-600" },
};

export default function KategoriMateriPage() {
  const params = useParams();
  const slug = (params.kategori as string) ?? "";
  
  const [categoryData, setCategoryData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/materi")
      .then((r) => r.json())
      .then((data) => {
        if (data?.categories) {
          const dbCat = data.categories.find((c: any) => c.id === slug);
          if (dbCat) {
            const meta = catStaticMetadata[slug] || {
              nama: dbCat.nama,
              icon: dbCat.icon ?? "📚",
              level: dbCat.level,
              desc: dbCat.desc ?? "",
              color: "from-slate-600/10 to-transparent border-slate-500/20",
            };

            // Compute dynamic status / locking (linear progression)
            let previousCompleted = true;
            const mappedMateri = dbCat.materi.map((m: any) => {
              let status = m.status; // "lulus" | "dalam_proses" | "belum"
              
              if (status !== "lulus" && status !== "dalam_proses") {
                if (previousCompleted) {
                  status = "tersedia";
                } else {
                  status = "terkunci";
                }
              }
              
              if (status !== "lulus") {
                previousCompleted = false;
              }

              // Extract Arabic letter or symbol as icon
              let icon = "📖";
              if (m.judul.includes("(")) {
                const match = m.judul.match(/\(([^)]+)\)/);
                if (match) icon = match[1];
              } else if (slug === "tahsin") {
                icon = "📍";
              } else if (slug === "tajwid") {
                icon = "ن";
              }

              return {
                ...m,
                status,
                icon,
                durasi: "2 menit", // static mockup
              };
            });

            setCategoryData({
              ...dbCat,
              ...meta,
              materi: mappedMateri,
            });
          }
        }
      })
      .catch((err) => console.error("Error loading category materials:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="px-4 pt-8 pb-4 space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="px-4 pt-8 pb-4 flex flex-col items-center justify-center min-h-[60dvh] gap-4 animate-fade-in">
        <span className="text-5xl">🔍</span>
        <p className="text-slate-400">Kategori tidak ditemukan.</p>
        <Link href="/dashboard/materi" className="btn-ghost text-sm">
          ← Kembali ke Materi
        </Link>
      </div>
    );
  }

  const selesai = categoryData.materi.filter((m: any) => m.status === "lulus").length;
  const pct = categoryData.materi.length > 0 ? Math.round((selesai / categoryData.materi.length) * 100) : 0;

  return (
    <div className="px-4 pt-8 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/materi"
          className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
          aria-label="Kembali"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-100">{categoryData.nama}</h1>
          <p className="text-xs text-slate-400">{categoryData.desc}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className={`glass-card p-5 border bg-gradient-to-br ${categoryData.color} relative overflow-hidden`}>
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-arabic text-2xl">
            {categoryData.icon}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Progres</p>
            <p className="font-bold text-slate-100">
              {selesai} / {categoryData.materi.length} materi
            </p>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">{pct}% selesai</p>
      </div>

      {/* Materi List */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Daftar Materi</h2>
        <div className="space-y-2">
          {categoryData.materi.map((m: any, i: number) => {
            const isLocked = m.status === "terkunci";
            const cfg = statusConfig[m.status as keyof typeof statusConfig] || statusConfig.terkunci;
            return (
              <Link
                key={m.id}
                href={isLocked ? "#" : `/dashboard/materi/${slug}/${m.id}`}
                className={`glass-card ${!isLocked ? "glass-card-hover" : "opacity-50"} p-4 flex items-center gap-3 animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${isLocked ? "pointer-events-none" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-arabic text-xl flex-shrink-0">
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isLocked ? "text-slate-500" : "text-slate-200"}`}>
                    {m.judul}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">🎬 {m.durasi}</p>
                </div>
                <span className={`badge ${cfg.className} flex-shrink-0 text-xs`}>{cfg.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
