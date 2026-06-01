"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "santri",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

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
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4 animate-float">
            <span className="text-3xl">📖</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Buat Akun Baru</h1>
          <p className="text-sm text-slate-400">
            Bergabunglah dengan QuranEdutech — gratis selamanya
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">
                Nama Lengkap
              </label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ahmad Fauzan"
                  className="input-field-icon"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">
                Email
              </label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="contoh@email.com"
                  className="input-field-icon"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">
                Password{" "}
                <span className="text-slate-600 normal-case tracking-normal font-normal">(min. 8 karakter)</span>
              </label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="input-field-icon"
                  style={{ paddingRight: "2.75rem" }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Tampilkan password"
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label htmlFor="confirm" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">
                Konfirmasi Password
              </label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                  className="input-field-icon"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
              </div>
            </div>

            {/* Role Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-widest">
                Saya adalah...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "santri" })}
                  className={`role-card ${form.role === "santri" ? "active" : ""}`}
                >
                  <div className="role-card-icon">🎓</div>
                  <div>
                    <div className="text-sm font-bold text-white leading-tight">Santri</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Pelajar Al-Qur&apos;an</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "ustadz" })}
                  className={`role-card ${form.role === "ustadz" ? "active" : ""}`}
                >
                  <div className="role-card-icon">🧑‍🏫</div>
                  <div>
                    <div className="text-sm font-bold text-white leading-tight">Ustadz</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Pengajar / Guru</div>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-register"
              disabled={loading}
              className="btn-brand w-full mt-1 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mendaftar...
                </span>
              ) : (
                "🚀 Daftar Sekarang"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
