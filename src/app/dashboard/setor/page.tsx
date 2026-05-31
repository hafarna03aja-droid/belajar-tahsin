"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Status = "idle" | "recording" | "preview" | "submitted";

type SubmissionRecord = {
  id: string;
  surah: string;
  ayat: string;
  durasiDetik: number;
  status: string;
  slaDeadline: string;
  submittedAt: string;
  catatanUstadz: string | null;
  reviewedAt: string | null;
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  menunggu: { label: "Menunggu", cls: "badge-warning" },
  diproses: { label: "Diproses", cls: "badge-blue" },
  selesai:  { label: "Selesai ✅", cls: "badge-success" },
};

export default function SetorPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [surah, setSurah] = useState("");
  const [ayat, setAyat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [history, setHistory] = useState<SubmissionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const MAX_SECONDS = 120;

  // Load riwayat setoran dari API
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/setor");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.submissions ?? []);
      }
    } catch {
      // Gagal load history — tidak kritikal
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const stopRecording = useCallback((finalElapsed?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    }
    if (finalElapsed !== undefined) setAudioDuration(finalElapsed);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("preview");
      };
      mediaRecorderRef.current = mr;
      mr.start(500);
      setStatus("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((v) => {
          if (v + 1 >= MAX_SECONDS) {
            stopRecording(v + 1);
          }
          return v + 1;
        });
      }, 1000);
    } catch {
      alert("Izin mikrofon ditolak. Aktifkan mikrofon di pengaturan browser.");
    }
  }, [stopRecording]);

  const handleStopRecording = useCallback(() => {
    stopRecording(elapsed);
  }, [stopRecording, elapsed]);

  const handleSubmit = async () => {
    if (!surah || !ayat) {
      setError("Harap isi nama Surah dan nomor Ayat terlebih dahulu.");
      return;
    }
    if (!audioUrl) {
      setError("Rekam audio terlebih dahulu.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/setor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surah,
          ayat,
          audioDataUrl: audioUrl, // blob URL as placeholder
          durasiDetik: audioDuration || elapsed || 1,
          catatan,
        }),
      });

      if (res.ok) {
        setIsSubmitting(false);
        setStatus("submitted");
        await loadHistory();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mengirim setoran. Coba lagi.");
        setIsSubmitting(false);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStatus("idle");
    setAudioUrl(null);
    setSurah("");
    setAyat("");
    setCatatan("");
    setElapsed(0);
    setAudioDuration(0);
    setError("");
    setIsSubmitting(false);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const pct = Math.min((elapsed / MAX_SECONDS) * 100, 100);

  if (status === "submitted") {
    return (
      <div className="px-4 pt-8 pb-4 flex flex-col items-center justify-center min-h-[60dvh] gap-6 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-brand-600/20 border-2 border-brand-500/50 flex items-center justify-center text-4xl animate-float">
          ✅
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-100 mb-2">Setoran Terkirim!</h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Audio setoran Anda telah diterima dan akan dikoreksi oleh Ustadz dalam waktu maksimal{" "}
            <strong className="text-brand-400">24 jam</strong>.
          </p>
        </div>
        <div className="glass-card p-5 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="badge badge-warning">SLA: 24 jam</span>
            <span className="badge badge-blue">Menunggu</span>
          </div>
          <p className="text-sm text-slate-300">
            <span className="text-slate-400">Surah:</span> {surah}
          </p>
          <p className="text-sm text-slate-300 mt-1">
            <span className="text-slate-400">Ayat:</span> {ayat}
          </p>
          {catatan && (
            <p className="text-sm text-slate-300 mt-1">
              <span className="text-slate-400">Catatan:</span> {catatan}
            </p>
          )}
        </div>
        <button className="btn-ghost" onClick={reset}>
          Setor Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-6 space-y-7 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Setor Ayat</h1>
        <p className="text-sm text-slate-400 mt-2">Rekam bacaanmu dan kirim ke Ustadz</p>
      </div>

      {/* SLA info */}
      <div className="glass-card p-5 border border-gold-500/20 flex items-center gap-4">
        <span className="text-2xl">👨‍🏫</span>
        <div>
          <p className="text-sm font-medium text-slate-200">Ustadz siap mereview</p>
          <p className="text-xs text-slate-400">
            Garansi koreksi kembali dalam{" "}
            <span className="text-gold-400 font-semibold">24 jam</span>
          </p>
        </div>
        <span className="badge badge-success ml-auto">Online</span>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Surah & Ayat input */}
      {(status === "idle" || status === "preview") && (
        <div className="space-y-5">
          <div>
            <label htmlFor="surah-input" className="block text-sm font-semibold text-slate-300 mb-3">
              Nama Surah
            </label>
            <input
              id="surah-input"
              type="text"
              placeholder="contoh: Al-Fatihah"
              className="input-field"
              value={surah}
              onChange={(e) => setSurah(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="ayat-input" className="block text-sm font-semibold text-slate-300 mb-3">
              Nomor Ayat
            </label>
            <input
              id="ayat-input"
              type="text"
              placeholder="contoh: 1-7"
              className="input-field"
              value={ayat}
              onChange={(e) => setAyat(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Recording UI */}
      <div className="glass-card p-7 flex flex-col items-center gap-5">
        {status === "recording" && (
          <>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="text-red-400 font-medium animate-pulse">● Merekam...</span>
                <span>
                  {fmt(elapsed)} / {fmt(MAX_SECONDS)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill bg-gradient-to-r from-red-600 to-red-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </>
        )}

        {status === "preview" && audioUrl && (
          <div className="w-full">
            <p className="text-sm text-slate-400 mb-2">
              Pratinjau rekaman ({fmt(audioDuration || elapsed)})
            </p>
            <audio
              controls
              className="w-full"
              src={audioUrl}
              style={{ filter: "invert(0.8) hue-rotate(100deg)" }}
            />
          </div>
        )}

        <button
          id="setor-mic-button"
          onClick={status === "recording" ? handleStopRecording : startRecording}
          disabled={isSubmitting}
          className={`mic-button ${status === "recording" ? "recording" : ""} disabled:opacity-60`}
          aria-label={status === "recording" ? "Berhenti merekam" : "Mulai merekam"}
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            {status === "recording" ? (
              <rect x="6" y="6" width="12" height="12" rx="2" />
            ) : (
              <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9v-2h-1v2h1z" />
            )}
          </svg>
        </button>
        <p className="text-xs text-slate-500">Maksimal 2 menit rekaman</p>
      </div>

      {/* Catatan */}
      {status === "preview" && (
        <div>
          <label htmlFor="catatan-input" className="block text-sm font-semibold text-slate-300 mb-3">
            Catatan untuk Ustadz (opsional)
          </label>
          <textarea
            id="catatan-input"
            rows={3}
            placeholder="Contoh: Saya masih bingung hukum tajwid pada ayat 3..."
            className="input-field resize-none"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
      )}

      {/* Actions */}
      {status === "preview" && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setStatus("idle");
              setAudioUrl(null);
              setElapsed(0);
              setAudioDuration(0);
            }}
            className="btn-ghost flex-1"
          >
            Rekam Ulang
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-brand flex-1 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengirim...
              </span>
            ) : (
              "Kirim ke Ustadz →"
            )}
          </button>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Riwayat Setoran
        </h2>
        {loadingHistory ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card p-5 flex flex-col items-center gap-2 text-center">
            <span className="text-3xl">📭</span>
            <p className="text-sm text-slate-500">Belum ada riwayat setoran</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((s) => {
              const cfg = statusBadge[s.status] ?? { label: s.status, cls: "bg-white/5 text-slate-400" };
              const date = new Date(s.submittedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <div key={s.id} className="glass-card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-xl flex-shrink-0">
                    🎙️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {s.surah} — Ayat {s.ayat}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{date} · {s.durasiDetik}s</p>
                  </div>
                  <span className={`badge ${cfg.cls} flex-shrink-0 text-xs`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
