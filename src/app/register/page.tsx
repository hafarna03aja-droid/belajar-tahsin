"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/login?registered=true");
    } else {
      setError(data.error || "Pendaftaran gagal.");
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[360px] h-[360px] rounded-full bg-gold-500/8 blur-[100px]" />
      </div>

      <div className="w-full max-w-[480px] animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-600/20 border border-brand-500/30 mb-5 animate-float">
            <span className="text-4xl">🕌</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Buat Akun Baru</h1>
          <p className="text-base text-slate-400 mt-1">Mulai perjalanan belajar Al-Qur&apos;an Anda</p>
        </div>

        {/* Card */}
        <div className="glass-card p-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-3">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Ahmad Fauzan"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-300 mb-3">Email</label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                placeholder="contoh@email.com"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-300 mb-3">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-slate-300 mb-3">Konfirmasi Password</label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Ulangi password"
                className="input-field"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mendaftar...
                </span>
              ) : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
