"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Email atau password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] right-[-120px] w-[450px] h-[450px] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[360px] h-[360px] rounded-full bg-gold-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-[460px] animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-600/20 border border-brand-500/30 mb-5 animate-float">
            <span className="text-4xl">🕌</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">QuranEdutech</h1>
          <p className="text-base text-slate-400 mt-1">Masuk ke akun Anda</p>
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
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-3">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="contoh@email.com"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-3">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  Memproses...
                </span>
              ) : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Belum punya akun?{" "}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Dengan masuk, Anda menyetujui syarat dan ketentuan kami.
        </p>
      </div>
    </div>
  );
}
