"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

type Submission = {
  id: string;
  surah: string;
  ayat: string;
  audioUrl: string;
  durasiDetik: number;
  status: string;
  slaDeadline: string;
  submittedAt: string;
  catatanUstadz: string | null;
  user: {
    name: string | null;
    email: string;
  };
};

export default function UstadzDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  
  // Review form states
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Audio playing state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ustadz") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Fetch pending submissions
  const loadSubmissions = () => {
    setLoading(true);
    fetch("/api/ustadz/review")
      .then((r) => r.json())
      .then((data) => {
        if (data?.submissions) {
          setSubmissions(data.submissions);
        }
      })
      .catch((err) => console.error("Error loading submissions:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ustadz") {
      loadSubmissions();
    }
  }, [status, session]);

  // Audio Playback Handler
  const togglePlayAudio = (sub: Submission) => {
    const isBlobPlaceholder = sub.audioUrl ? false : true; // standard check
    // Use placeholder audio since we don't store actual raw binaries in sqlite
    const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

    if (playingId === sub.id) {
      audioPlayerRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      setPlayingId(sub.id);

      audio.onended = () => {
        setPlayingId(null);
      };

      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setPlayingId(null);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  const handleSelectSubmission = (sub: Submission) => {
    setSelectedSub(sub);
    setCatatan("");
    setError("");
    setSuccess("");
  };

  const handleSubmitReview = async () => {
    if (!selectedSub) return;
    if (!catatan.trim()) {
      setError("Harap berikan catatan koreksi terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/ustadz/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          catatanUstadz: catatan,
        }),
      });

      if (res.ok) {
        setSuccess("Penilaian berhasil dikirim!");
        // Stop audio if playing
        if (playingId === selectedSub.id && audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          setPlayingId(null);
        }
        setSelectedSub(null);
        loadSubmissions();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mengirim penilaian.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || !session || session.user.role !== "ustadz") {
    return (
      <div className="p-4 pt-8 space-y-4 animate-fade-in">
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  const ustadzName = session.user.name ?? "Ustadz";

  return (
    <div className="px-4 pt-10 pb-6 space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Dasbor Penilai</p>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {ustadzName} <span className="badge badge-success text-[10px] py-0.5">Ustadz</span>
          </h1>
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

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold text-center animate-fade-in-up">
          {success}
        </div>
      )}

      {/* Review Section (Modal-like card) */}
      {selectedSub && (
        <div className="glass-card p-6 border border-brand-500/20 space-y-5 animate-fade-in-up">
          <div className="flex justify-between items-start">
            <div>
              <span className="badge badge-warning text-[10px] py-0.5 mb-1.5">Sedang Dinilai</span>
              <h2 className="text-sm font-bold text-slate-200">
                {selectedSub.surah} — Ayat {selectedSub.ayat}
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Oleh: {selectedSub.user.name ?? selectedSub.user.email}
              </p>
            </div>
            <button
              onClick={() => setSelectedSub(null)}
              className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
            >
              ✕ Batal
            </button>
          </div>

          {/* Audio Player */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-300">Rekaman Suara Siswa</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Durasi: {selectedSub.durasiDetik} detik</p>
            </div>
            <button
              onClick={() => togglePlayAudio(selectedSub)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                playingId === selectedSub.id
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-brand-600 text-white hover:bg-brand-500"
              }`}
            >
              {playingId === selectedSub.id ? "⏸" : "▶"}
            </button>
          </div>

          {/* Review Input */}
          <div className="space-y-3">
            <label htmlFor="koreksi-input" className="block text-sm font-semibold text-slate-300">
              Catatan Koreksi (Makhraj, Tajwid &amp; Saran)
            </label>
            <textarea
              id="koreksi-input"
              rows={4}
              placeholder="Contoh: Bacaan Anda sudah baik, namun perhatikan sifat Hams pada huruf Ta (ت) ketika berharakat sukun..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="input-field text-xs resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <div className="flex gap-2">
            <button
              disabled={submitting}
              onClick={handleSubmitReview}
              className="btn-brand flex-1 py-3 text-xs"
            >
              {submitting ? "Mengirim..." : "Kirim Penilaian Koreksi"}
            </button>
          </div>
        </div>
      )}

      {/* Submissions Queue */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Antrean Setoran Siswa ({submissions.length})
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass-card p-8 flex flex-col items-center gap-2 text-center">
            <span className="text-4xl">📭</span>
            <p className="text-sm font-medium text-slate-300">Semua setoran selesai dinilai!</p>
            <p className="text-xs text-slate-500">Tidak ada antrean setoran yang tertunda saat ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub, i) => {
              const submittedDate = new Date(sub.submittedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              
              // Calculate SLA warning
              const deadline = new Date(sub.slaDeadline);
              const isUrgent = deadline.getTime() - Date.now() < 6 * 60 * 60 * 1000; // Less than 6 hours left

              return (
                <div
                  key={sub.id}
                  className={`glass-card p-5 flex items-center justify-between border hover:border-brand-500/20 transition-all ${
                    selectedSub?.id === sub.id ? "border-brand-500 bg-brand-600/5" : "border-white/5"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200 text-sm">
                        {sub.surah} — Ayat {sub.ayat}
                      </span>
                      <span className={`badge text-[9px] py-0.5 ${isUrgent ? "badge-danger" : "badge-warning"}`}>
                        {isUrgent ? "🚨 SLA mepet" : "⏳ 24j SLA"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Siswa: {sub.user.name ?? sub.user.email}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Masuk: {submittedDate} · {sub.durasiDetik}s</p>
                  </div>
                  <button
                    onClick={() => handleSelectSubmission(sub)}
                    className="btn-brand text-xs py-2 px-4 flex-shrink-0"
                  >
                    Nilai
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
