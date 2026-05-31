"use client";

import { useState, useRef, useCallback } from "react";

type WordResult = {
  word: string;
  status: "correct" | "warning" | "error" | "idle";
  note?: string;
};

const DEMO_AYAT: WordResult[] = [
  { word: "بِسْمِ", status: "idle" },
  { word: "اللَّهِ", status: "idle" },
  { word: "الرَّحْمَٰنِ", status: "idle" },
  { word: "الرَّحِيمِ", status: "idle" },
];

const MOCK_RESULT: WordResult[] = [
  { word: "بِسْمِ", status: "correct", note: "Sempurna!" },
  { word: "اللَّهِ", status: "correct", note: "Sempurna!" },
  { word: "الرَّحْمَٰنِ", status: "warning", note: "Ghunnah kurang panjang" },
  { word: "الرَّحِيمِ", status: "correct", note: "Sempurna!" },
];

export default function LatihanAIPage() {
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [words, setWords] = useState<WordResult[]>(DEMO_AYAT);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setResult(null);
      setWords(DEMO_AYAT);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((v) => v + 1), 1000);
    } catch {
      alert("Izin mikrofon ditolak. Aktifkan mikrofon di pengaturan browser Anda.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setAnalyzing(true);

    // Simulate AI processing (mock)
    setTimeout(() => {
      setWords(MOCK_RESULT);
      setResult({
        score: 88,
        feedback: "Bacaan Anda sudah sangat baik! Perhatikan ghunnah pada kata الرَّحْمَٰنِ — dengungnya perlu sedikit diperpanjang (2 harakat).",
      });
      setAnalyzing(false);
    }, 2000);
  }, []);

  const statusClass = (s: WordResult["status"]) => {
    if (s === "correct") return "tajwid-correct";
    if (s === "warning") return "tajwid-warning";
    if (s === "error") return "tajwid-error";
    return "text-slate-200";
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="px-4 pt-10 pb-6 space-y-7 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Latihan AI</h1>
        <p className="text-sm text-slate-400 mt-2">Tekan mikrofon dan baca ayat di bawah ini</p>
      </div>

      {/* Ayat Display */}
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent pointer-events-none" />
        <p className="text-xs text-slate-500 mb-5 uppercase tracking-widest">Al-Fatihah : 1</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mb-4" dir="rtl">
          {words.map((w, i) => (
            <span
              key={i}
              className={`font-arabic text-4xl transition-colors duration-500 cursor-pointer relative group ${statusClass(w.status)}`}
            >
              {w.word}
              {w.note && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                  {w.note}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Benar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />Tajwid kurang
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Makhraj salah
          </span>
        </div>
      </div>

      {/* Mic Button */}
      <div className="flex flex-col items-center gap-5 py-2">
        {recording && (
          <p className="text-sm text-red-400 font-medium animate-pulse">
            ⏱ Merekam... {fmt(elapsed)}
          </p>
        )}
        {analyzing && (
          <p className="text-sm text-brand-400 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Menganalisis bacaan...
          </p>
        )}
        <button
          id="mic-button"
          onClick={recording ? stopRecording : startRecording}
          disabled={analyzing}
          className={`mic-button ${recording ? "recording" : ""} disabled:opacity-50`}
          aria-label={recording ? "Berhenti merekam" : "Mulai merekam"}
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
          {recording ? "Ketuk untuk berhenti" : "Ketuk untuk mulai merekam"}
        </p>
      </div>

      {/* AI Result */}
      {result && (
        <div className="glass-card p-6 border border-brand-500/20 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center text-2xl font-bold text-brand-400">
              {result.score}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Skor AI</p>
              <p className="font-semibold text-slate-100">
                {result.score >= 90 ? "Luar Biasa! 🌟" : result.score >= 80 ? "Sangat Baik! ✨" : "Perlu Latihan"}
              </p>
            </div>
          </div>
          <div className="progress-bar mb-3">
            <div className="progress-fill" style={{ width: `${result.score}%` }} />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{result.feedback}</p>
          <button
            className="btn-brand w-full mt-4"
            onClick={() => { setWords(DEMO_AYAT); setResult(null); }}
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}
