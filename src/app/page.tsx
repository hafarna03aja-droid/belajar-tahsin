import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuranEdutech — Belajar Al-Qur'an Berbasis AI",
  description:
    "Platform edutech modern dengan koreksi pelafalan AI real-time dan bimbingan Ustadz terverifikasi.",
};

const features = [
  {
    icon: "🤖",
    title: "Koreksi AI Real-time",
    desc: "Analisis makhraj dan tajwid instan saat Anda membaca, dengan umpan balik visual warna-warni.",
  },
  {
    icon: "📚",
    title: "100+ Materi Terstruktur",
    desc: "Kurikulum dari Hijaiyah dasar hingga tajwid mahir, dilengkapi video, teks, dan latihan.",
  },
  {
    icon: "👨‍🏫",
    title: "Ustadz Terverifikasi",
    desc: "Setor ayat Anda dan dapatkan koreksi audio + catatan dari ustadz berpengalaman dalam 24 jam.",
  },
  {
    icon: "📖",
    title: "Al-Qur'an Digital",
    desc: "Mushaf interaktif dengan mode Per Kata, Per Ayat, dan audio contoh bacaan syekh.",
  },
  {
    icon: "🏆",
    title: "Gamifikasi & Streak",
    desc: "Kuis mini, poin harian, dan streak belajar untuk menjaga semangat dan konsistensi Anda.",
  },
  {
    icon: "🔒",
    title: "Privasi Terjaga",
    desc: "Audio rekaman terenkripsi AES-256. Data pribadi Anda aman dan tidak dibagikan kepada siapapun.",
  },
];

const stats = [
  { value: "10K+", label: "Pelajar Aktif" },
  { value: "100+", label: "Materi Tersedia" },
  { value: "98%", label: "SLA Ustadz" },
  { value: "<1.5s", label: "Latensi AI" },
];

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-dvh pt-28 md:pt-36 overflow-x-hidden w-full">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 w-full bg-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-4 sm:px-6 py-3 shadow-2xl">
          {/* Brand Logo - Designed with same style as Qur'an Flow logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-lg group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500 shadow-glow-brand flex items-center justify-center text-white font-arabic text-xl font-bold group-hover:scale-105 transition-transform">
              ق
            </div>
            <div className="flex flex-col">
              <span className="text-white text-base font-extrabold tracking-tight leading-none">QuranEdutech</span>
              <span className="text-[9px] tracking-widest text-sky-400 font-black uppercase mt-1">PLATFORM EDUKASI</span>
            </div>
          </Link>

          {/* Center Capsule Nav Menu */}
          <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-slate-950/40 border border-white/5 rounded-full backdrop-blur-md">
            <a href="#fitur" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Fitur Utama</a>
            <a href="#ai-demo" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Simulasi AI</a>
            <a href="#cta" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Mulai Perjalanan</a>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-amber-500 text-xs select-none">☀️</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/login" className="btn-orange-outline text-xs py-2 px-4">Masuk</Link>
            <Link href="/register" className="btn-brand text-xs py-2 px-5 shadow-glow-brand">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-16 pt-36 pb-28 md:pt-48 md:pb-40 max-w-7xl mx-auto relative overflow-hidden w-full">
        {/* Glowing orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-[100%] bg-sky-500/10 blur-[120px] opacity-70 animate-pulse-glow" />
          <div className="absolute top-40 right-10 w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[100px] opacity-60" />
          <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full bg-sky-700/10 blur-[120px] opacity-50" />
        </div>

        <div className="relative max-w-5xl mx-auto space-y-10 px-4 sm:px-6 md:px-8">
          {/* Platform Tag Badge */}
          <div className="inline-block animate-fade-in-up">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/60 border border-white/5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_#38bdf8]" />
              <span className="text-[10px] tracking-wider font-bold text-slate-300 uppercase">Platform Edutech Al-Qur&apos;an #1</span>
            </div>
          </div>

          {/* Heading with styled amber highlight underline */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-snug pb-2 animate-fade-in-up stagger-1 tracking-tight text-white drop-shadow-lg max-w-4xl mx-auto">
              Belajar Al-Qur&apos;an <br className="hidden sm:block" />
              <span className="gradient-text relative inline-block">
                Lebih Cerdas
                <span className="absolute bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" />
              </span>{" "}
              dengan AI
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2 font-light">
              Koreksi makhraj dan tajwid secara <strong className="text-white font-semibold">real-time</strong>, materi terstruktur, dan bimbingan Ustadz terverifikasi — semuanya dalam satu aplikasi yang elegan.
            </p>
          </div>

          {/* Arabic Verse Floating Card */}
          <div className="inline-block animate-fade-in-up pt-4">
            <div className="glass-card px-8 py-5 border-amber-500/20 shadow-glow-gold space-y-2">
              <p className="font-arabic text-2xl sm:text-3xl text-amber-400 tracking-widest drop-shadow-md">
                اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
              </p>
              <p className="text-[10px] text-slate-400 tracking-wide uppercase font-medium">QS. Al-&apos;Alaq: 1 — &quot;Bacalah dengan nama Tuhanmu yang menciptakan&quot;</p>
            </div>
          </div>

          {/* Stats Capsule Container - Exactly as structured in screenshot 2 */}
          <div className="glass-card shadow-glow-brand/5 border-sky-500/10 max-w-5xl mx-auto w-full p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 mt-20 sm:mt-28 relative z-20">
            {/* Left stats */}
            <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
              <div className="text-center sm:text-left">
                <span className="text-3xl font-black text-amber-500 block leading-none">{stats[0].value}</span>
                <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase mt-1.5 block">{stats[0].label}</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div className="text-center sm:text-left">
                <span className="text-3xl font-black text-amber-500 block leading-none">{stats[1].value}</span>
                <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase mt-1.5 block">{stats[1].label}</span>
              </div>
            </div>

            {/* Center CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-center">
              <Link href="/register" className="btn-orange-glow text-sm px-6 py-3 w-full sm:w-auto text-center">
                Mulai Belajar Gratis
              </Link>
              <a href="#ai-demo" className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors py-2">
                <span>▶</span> Lihat Demo Interaktif
              </a>
            </div>

            {/* Right stats */}
            <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div className="text-center sm:text-left">
                <span className="text-3xl font-black text-amber-500 block leading-none">{stats[2].value}</span>
                <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase mt-1.5 block">{stats[2].label}</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div className="text-center sm:text-left">
                <span className="text-3xl font-black text-amber-500 block leading-none">{stats[3].value}</span>
                <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase mt-1.5 block">{stats[3].label}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="fitur" className="px-6 sm:px-8 lg:px-16 py-28 md:py-40 max-w-7xl mx-auto w-full border-t border-white/5 bg-slate-950/10">
        <div className="text-center mb-20 sm:mb-28 space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Semua yang Anda Butuhkan, <br className="sm:hidden" />
            <span className="gradient-text"> Dalam Satu Platform</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Dirancang khusus untuk membantu setiap Muslim belajar Al-Qur&apos;an dengan cara yang modern, terstruktur, dan elegan.
          </p>
        </div>

        {/* Features card grid with big padding and custom wrappers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card glass-card-hover p-8 md:p-10 animate-fade-in-up stagger-${(i % 5) + 1} flex flex-col space-y-6`}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-3xl shadow-inner shrink-0">
                {f.icon}
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl text-white tracking-tight">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AI SIMULATION (Two Columns layout from screenshot 3 style) ─── */}
      <section id="ai-demo" className="px-6 sm:px-8 lg:px-16 py-28 md:py-40 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Info & Steps Legend */}
          <div className="space-y-10 text-left">
            <div className="space-y-5">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Coba Koreksi <br />
                <span className="gradient-text">AI Sekarang</span>
              </h2>
              <p className="text-slate-400 text-base sm:text-lg font-light leading-relaxed">
                Tekan tombol mikrofon, baca ayat Al-Qur&apos;an, dan lihat analisis tajwid Anda secara instan. Hasil analisis instan membantu memperbaiki pelafalan Anda.
              </p>
            </div>

            {/* Steps Legend with gold circles */}
            <div className="space-y-7 pt-8 border-t border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-amber-500/40 bg-amber-500/5 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 mt-0.5">
                  01
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Tajwid Sempurna</h4>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Warna hijau menunjukkan pelafalan yang benar dan fasih sesuai hukum tajwid.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-amber-500/40 bg-amber-500/5 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 mt-0.5">
                  02
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Perlu Perbaikan</h4>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Warna kuning menunjukkan panjang pendek atau dengung yang kurang tepat.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-amber-500/40 bg-amber-500/5 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 mt-0.5">
                  03
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Makhraj Salah</h4>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Warna merah mendeteksi kekeliruan fatal pada huruf makhraj yang diucapkan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High Fidelity Preview Card with Floating Arabic Letter */}
          <div className="relative">
            {/* Floating background letter 'ص' (sad) faint */}
            <div className="absolute -top-10 -right-10 text-[10rem] font-arabic text-slate-800/10 pointer-events-none select-none">
              ص
            </div>
            
            <div className="glass-card p-6 sm:p-8 lg:p-10 border-sky-500/15 shadow-2xl relative overflow-hidden bg-slate-950/40">
              {/* Floating background letter 'ب' (beh) in light blue */}
              <div className="absolute bottom-6 right-6 text-8xl font-arabic text-sky-500/5 pointer-events-none select-none animate-float">
                ب
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-slate-300 font-bold tracking-wider uppercase">Merekam Suara...</span>
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                    AI Accuracy: 98.4%
                  </div>
                </div>
                
                <div className="text-center py-6">
                  <p className="font-arabic text-3xl sm:text-4xl md:text-5xl py-4 tracking-widest drop-shadow-md">
                    <span className="tajwid-correct transition-colors duration-300">بِسْمِ </span>
                    <span className="tajwid-correct transition-colors duration-300">اللَّهِ </span>
                    <span className="tajwid-warning transition-colors duration-300">الرَّحْمَٰنِ </span>
                    <span className="tajwid-correct transition-colors duration-300">الرَّحِيمِ</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    Tajwid Sempurna
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                    Perlu Perbaikan
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                    Makhraj Salah
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 shadow-glow-brand animate-pulse-glow">
                    <span className="text-2xl">🎙️</span>
                  </div>
                  <Link href="/register" className="btn-brand text-sm px-6 py-3.5 shadow-glow-brand hover:scale-105 transition-transform font-bold w-full sm:w-auto text-center">
                    Coba Simulasi AI Gratis
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BOTTOM ─── */}
      <section id="cta" className="px-6 sm:px-8 lg:px-16 py-32 md:py-44 max-w-4xl mx-auto w-full text-center space-y-10">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md leading-tight">
            Siap Memulai Perjalanan?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-light leading-relaxed">
            Bergabunglah dengan ribuan Muslim yang sudah merasakan manfaat belajar Al-Qur&apos;an secara modern bersama QuranEdutech.
          </p>
        </div>
        <div className="pt-6">
          <Link href="/register" className="btn-orange-glow text-base px-10 py-4 shadow-lg hover:scale-105 transition-transform font-bold">
            Daftar Gratis Sekarang
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 px-6 py-14 text-center text-xs sm:text-sm text-slate-500 bg-slate-950/20">
        © {new Date().getFullYear()} QuranEdutech. Dibuat dengan ❤️ untuk umat Islam.
      </footer>
    </main>
  );
}
