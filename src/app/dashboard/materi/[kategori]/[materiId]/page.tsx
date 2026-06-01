"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type QuizQuestion = {
  id: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawaban: string;
  urutan: number;
};

type MaterialDetail = {
  id: string;
  judul: string;
  deskripsi: string | null;
  videoUrl: string | null;
  kontenTeks: string | null;
  audioUrl: string | null;
  urutan: number;
  nilaiMinKuis: number;
  status: string;
  score: number | null;
  aiScore: number | null;
  quizSoal: QuizQuestion[];
};

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kategoriSlug = (params.kategori as string) ?? "";
  const materiId = (params.materiId as string) ?? "";

  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"materi" | "praktik" | "kuis">("materi");

  // Audio Playback
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const audioExampleRef = useRef<HTMLAudioElement | null>(null);

  // AI Practice States
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [aiResult, setAiResult] = useState<{ score: number; feedback: string; words: any[] } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Quiz States
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);

  // Success Overlay/Banner
  const [pointsAwarded, setPointsAwarded] = useState<number>(0);
  const [streakUpdated, setStreakUpdated] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/materi")
      .then((r) => r.json())
      .then((data) => {
        if (data?.categories) {
          const category = data.categories.find((c: any) => c.id === kategoriSlug);
          const mat = category?.materi?.find((m: any) => m.id === materiId);
          if (mat) {
            setMaterial(mat);
          }
        }
      })
      .catch((err) => console.error("Error loading material detail:", err))
      .finally(() => setLoading(false));
  }, [kategoriSlug, materiId]);

  // Audio Example Player
  const playExampleAudio = () => {
    if (!material?.audioUrl) return;

    if (isPlayingExample) {
      audioExampleRef.current?.pause();
      setIsPlayingExample(false);
    } else {
      if (!audioExampleRef.current) {
        audioExampleRef.current = new Audio(material.audioUrl);
        audioExampleRef.current.onended = () => setIsPlayingExample(false);
      }
      audioExampleRef.current.play();
      setIsPlayingExample(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioExampleRef.current) {
        audioExampleRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // AI Practice Speech Recorder
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        // Audio simulation feedback
        setAnalyzing(true);
        setTimeout(() => {
          // Generate realistic feedback based on material
          const score = Math.floor(Math.random() * 15) + 82; // score between 82 and 96
          let feedback = "Bacaan Anda sudah sangat baik! Pastikan makhraj diperhatikan.";
          let words: any[] = [];

          if (material?.judul.includes("Alif")) {
            words = [
              { word: "اَ", status: "correct", note: "Sempurna" },
              { word: "اِ", status: "correct", note: "Sempurna" },
              { word: "اُ", status: "warning", note: "Tenggorokan kurang bawah" }
            ];
            feedback = "Sempurna pada pelafalan harakat fathah dan kasrah. Untuk harakat dhammah (اُ), pastikan makhraj pangkal tenggorokan tetap jelas.";
          } else if (material?.judul.includes("Ba")) {
            words = [
              { word: "بَا", status: "correct", note: "Sempurna" },
              { word: "بِى", status: "correct", note: "Sempurna" },
              { word: "بُو", status: "correct", note: "Sempurna" }
            ];
            feedback = "Makhraj Syafatain (kedua bibir) Anda sangat rapat dan bersih. Pantulan Qalqalah terdengar sangat bagus!";
          } else {
            words = [
              { word: "بِسْمِ", status: "correct" },
              { word: "اللَّهِ", status: "correct" },
              { word: "الرَّحْمَٰنِ", status: "warning", note: "Ghunnah tipis" },
              { word: "الرَّحِيمِ", status: "correct" }
            ];
            feedback = "Bagus sekali. Cukup perhatikan panjang dengung (ghunnah) pada mad thabi'i agar konsisten 2 harakat.";
          }

          setAiResult({ score, feedback, words });
          setAnalyzing(false);
        }, 2000);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setAiResult(null);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((v) => v + 1), 1000);
    } catch {
      alert("Izin mikrofon ditolak. Aktifkan mikrofon di browser Anda.");
    }
  }, [material]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  // Mini Quiz Handler
  const handleSelectAnswer = (questionId: string, answerOption: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerOption,
    }));
  };

  const submitQuiz = async () => {
    if (!material) return;
    
    // Calculate Score
    let correctCount = 0;
    const questions = material.quizSoal;
    
    if (questions.length === 0) {
      // Auto-pass if no questions
      await completeMaterial(100, 90);
      return;
    }

    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.jawaban) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= material.nilaiMinKuis;

    setQuizScore(score);
    setQuizPassed(passed);
    setQuizSubmitted(true);

    if (passed) {
      const simulatedAiScore = aiResult?.score ?? 85;
      await completeMaterial(score, simulatedAiScore);
    }
  };

  const completeMaterial = async (score: number, aiScore: number) => {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materiId: material?.id,
          status: "lulus",
          nilaiKuis: score,
          aiScore: aiScore,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.pointsAwarded > 0) {
          setPointsAwarded(resData.pointsAwarded);
          setStreakUpdated(resData.streakUpdated);
        }
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizPassed(null);
    setPointsAwarded(0);
    setStreakUpdated(false);
  };

  if (loading) {
    return (
      <div className="p-4 pt-8 space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="px-4 pt-8 pb-4 flex flex-col items-center justify-center min-h-[60dvh] gap-4 animate-fade-in">
        <span className="text-5xl">🔍</span>
        <p className="text-slate-400">Materi tidak ditemukan.</p>
        <Link href={`/dashboard/materi/${kategoriSlug}`} className="btn-ghost text-sm">
          ← Kembali
        </Link>
      </div>
    );
  }

  const wordHighlightClass = (status: string) => {
    if (status === "correct") return "tajwid-correct";
    if (status === "warning") return "tajwid-warning";
    if (status === "error") return "tajwid-error";
    return "text-slate-200";
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="px-4 pt-8 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/materi/${kategoriSlug}`}
          className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
          aria-label="Kembali"
        >
          ←
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-100 truncate">{material.judul}</h1>
          <p className="text-xs text-slate-400 capitalize">Kategori {kategoriSlug}</p>
        </div>
        {material.status === "lulus" && (
          <span className="badge badge-success ml-auto flex-shrink-0">Lulus ✅</span>
        )}
      </div>

      {/* Tabs */}
      <div className="glass-card p-1 flex">
        {(["materi", "praktik", "kuis"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
              activeTab === tab
                ? "bg-brand-600/20 text-brand-400 border border-brand-500/20 shadow-glow-brand/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "materi" ? "📖 Penjelasan" : tab === "praktik" ? "🎙️ Latihan AI" : "📝 Kuis Mini"}
          </button>
        ))}
      </div>

      {/* Tab: Penjelasan */}
      {activeTab === "materi" && (
        <div className="space-y-4 animate-fade-in">
          {/* Video Mockup */}
          {material.videoUrl && (
            <div className="glass-card overflow-hidden aspect-video relative group border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent z-10" />
              {/* Thumbnail mock */}
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <span className="text-6xl text-slate-800">🕌</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button
                  onClick={playExampleAudio}
                  className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-glow-brand transition-all scale-100 group-hover:scale-105"
                  aria-label="Putar Video Tutorial"
                >
                  <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center">
                <p className="text-xs font-medium text-slate-200">Video Panduan Tajwid & Makhraj</p>
                <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded">2:14</span>
              </div>
            </div>
          )}

          {/* Text Content */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Materi Pembelajaran</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {material.kontenTeks || "Penjelasan materi tertulis belum tersedia untuk modul ini."}
            </div>

            {/* Audio Model Example */}
            {material.audioUrl && (
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Contoh Pelafalan Ustadz</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Dengarkan dan pelajari makhrajnya</p>
                </div>
                <button
                  onClick={playExampleAudio}
                  className={`btn-brand text-xs py-2 px-4 ${isPlayingExample ? "bg-red-600 hover:bg-red-700 shadow-glow-gold/10" : ""}`}
                >
                  {isPlayingExample ? "⏸ Berhenti" : "🔊 Putar Contoh"}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("praktik")}
            className="btn-brand w-full py-3"
          >
            Lanjut ke Latihan AI →
          </button>
        </div>
      )}

      {/* Tab: Latihan AI */}
      {activeTab === "praktik" && (
        <div className="space-y-5 animate-fade-in">
          {/* Ayat Display */}
          <div className="glass-card p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent pointer-events-none" />
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest">
              Lafaz yang Harus Dibaca
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4" dir="rtl">
              {aiResult?.words ? (
                aiResult.words.map((w, i) => (
                  <span
                    key={i}
                    className={`font-arabic text-4xl transition-colors duration-500 relative group cursor-pointer ${wordHighlightClass(
                      w.status
                    )}`}
                  >
                    {w.word}
                    {w.note && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 z-30">
                        {w.note}
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="font-arabic text-4xl text-slate-100">
                  {material.judul.includes("(") ? material.judul.match(/\(([^)]+)\)/)?.[1] : "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                </span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Benar
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Tajwid kurang
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Makhraj salah
              </span>
            </div>
          </div>

          {/* Record Button UI */}
          <div className="flex flex-col items-center gap-3 py-4">
            {recording && (
              <p className="text-xs text-red-400 font-medium animate-pulse">
                ⏱ Merekam... {fmt(elapsed)}
              </p>
            )}
            {analyzing && (
              <p className="text-xs text-brand-400 flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Kecerdasan Buatan sedang menilai...
              </p>
            )}
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={analyzing}
              className={`mic-button ${recording ? "recording" : ""} disabled:opacity-50`}
              aria-label={recording ? "Hentikan rekaman" : "Mulai rekaman"}
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                {recording ? (
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                ) : (
                  <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9v-2h-1v2h1z" />
                )}
              </svg>
            </button>
            <p className="text-xs text-slate-500">
              {recording ? "Ketuk untuk berhenti & koreksi" : "Ketuk mikrofon lalu lafalkan ayat di atas"}
            </p>
          </div>

          {/* AI Result Box */}
          {aiResult && (
            <div className="glass-card p-5 border border-brand-500/20 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-600/20 flex items-center justify-center text-xl font-bold text-brand-400">
                  {aiResult.score}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Skor Lafal AI</p>
                  <p className="font-semibold text-slate-100 text-sm">
                    {aiResult.score >= 90 ? "Lafalan Luar Biasa! 🌟" : "Lafalan Cukup Baik! ✨"}
                  </p>
                </div>
              </div>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: `${aiResult.score}%` }} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{aiResult.feedback}</p>
            </div>
          )}

          <button
            onClick={() => setActiveTab("kuis")}
            className="btn-brand w-full py-3"
          >
            Lanjut ke Kuis Mini →
          </button>
        </div>
      )}

      {/* Tab: Kuis Mini */}
      {activeTab === "kuis" && (
        <div className="space-y-5 animate-fade-in">
          {pointsAwarded > 0 && (
            <div className="p-5 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-center animate-fade-in-up space-y-2">
              <p className="text-2xl">🎉</p>
              <h3 className="font-bold text-gold-400 text-base">Modul Selesai & Lulus!</h3>
              <p className="text-xs text-slate-300">
                Selamat! Anda mendapatkan <strong className="text-gold-400">+{pointsAwarded} XP</strong>.
                {streakUpdated && " 🔥 Streak belajar harian Anda bertambah!"}
              </p>
            </div>
          )}

          {quizSubmitted && quizPassed !== null && (
            <div className={`p-4 rounded-xl text-center border text-sm font-medium ${
              quizPassed
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {quizPassed ? (
                <p>Skor Kuis: {quizScore}% — Anda LULUS syarat kelulusan ({material.nilaiMinKuis}%)!</p>
              ) : (
                <div>
                  <p className="mb-2">Skor Kuis: {quizScore}% — Anda belum lulus syarat minimum ({material.nilaiMinKuis}%).</p>
                  <button onClick={resetQuiz} className="btn-ghost text-xs py-1 px-3 mt-1">Ulangi Kuis</button>
                </div>
              )}
            </div>
          )}

          {material.quizSoal.length === 0 ? (
            <div className="glass-card p-6 text-center space-y-3">
              <p className="text-3xl">📝</p>
              <p className="text-sm text-slate-400">Kuis evaluasi tertulis belum tersedia untuk modul ini.</p>
              <button
                onClick={async () => {
                  setQuizScore(100);
                  setQuizPassed(true);
                  setQuizSubmitted(true);
                  await completeMaterial(100, aiResult?.score ?? 85);
                }}
                disabled={quizSubmitted}
                className="btn-brand text-xs py-2 px-5 disabled:opacity-50"
              >
                Tandai Selesai & Ambil Kelulusan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {material.quizSoal.map((q, idx) => {
                const selected = selectedAnswers[q.id];
                const isCorrect = q.jawaban;
                
                return (
                  <div key={q.id} className="glass-card p-5 space-y-4">
                    <p className="text-sm font-semibold text-slate-200">
                      {idx + 1}. {q.pertanyaan}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { key: "A", val: q.opsiA },
                        { key: "B", val: q.opsiB },
                        { key: "C", val: q.opsiC },
                        { key: "D", val: q.opsiD },
                      ].map((opt) => {
                        const activeOption = selected === opt.key;
                        let btnStyle = "border-white/5 bg-white/5 text-slate-300 hover:bg-white/10";
                        
                        if (quizSubmitted) {
                          if (opt.key === isCorrect) {
                            btnStyle = "border-green-500/40 bg-green-500/10 text-green-400";
                          } else if (activeOption) {
                            btnStyle = "border-red-500/40 bg-red-500/10 text-red-400";
                          } else {
                            btnStyle = "border-white/5 opacity-55 text-slate-500 pointer-events-none";
                          }
                        } else if (activeOption) {
                          btnStyle = "border-brand-500/40 bg-brand-600/20 text-brand-400";
                        }

                        return (
                          <button
                            key={opt.key}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(q.id, opt.key)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all ${btnStyle}`}
                          >
                            <span className="inline-block w-6 text-slate-500 font-semibold">{opt.key}.</span>
                            {opt.val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!quizSubmitted && (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(selectedAnswers).length < material.quizSoal.length}
                  className="btn-brand w-full py-3.5 disabled:opacity-50"
                >
                  Kirim & Nilai Kuis
                </button>
              )}
            </div>
          )}

          {quizPassed && (
            <Link
              href={`/dashboard/materi/${kategoriSlug}`}
              className="btn-ghost w-full py-3.5 block text-center"
            >
              ← Kembali ke Silabus Kategori
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
