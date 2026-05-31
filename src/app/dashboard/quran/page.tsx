"use client";

import { useState, useEffect, useRef } from "react";

type Mode = "list" | "detail";

type SurahItem = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
};

type AyatItem = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
};

type SurahDetail = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  ayat: AyatItem[];
};

export default function QuranPage() {
  const [mode, setMode] = useState<Mode>("list");
  const [surahs, setSurahs] = useState<SurahItem[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState("");
  
  const [showLatin, setShowLatin] = useState(true);
  const [showTerjemah, setShowTerjemah] = useState(true);
  const [playingAyat, setPlayingAyat] = useState<number | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Fetch list of surahs on mount
  useEffect(() => {
    fetch("https://equran.id/api/v2/surat")
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 200 && res.data) {
          setSurahs(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat daftar surah:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch surah detail
  const openSurah = (nomor: number) => {
    setLoadingDetail(true);
    setMode("detail");
    setSelectedSurah(null);
    setPlayingAyat(null);
    setSelectedWord(null);

    // Stop current audio if playing
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    fetch(`https://equran.id/api/v2/surat/${nomor}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 200 && res.data) {
          setSelectedSurah(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat detail surah:", err))
      .finally(() => setLoadingDetail(false));
  };

  const playAudio = (ayat: AyatItem) => {
    // Get the first audio URL from the record
    const audioUrls = Object.values(ayat.audio);
    if (audioUrls.length === 0) return;
    const url = audioUrls[0];

    if (playingAyat === ayat.nomorAyat) {
      audioPlayerRef.current?.pause();
      setPlayingAyat(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      setPlayingAyat(ayat.nomorAyat);
      
      audio.onended = () => {
        setPlayingAyat(null);
      };
      
      audio.play().catch((err) => {
        console.error("Gagal memutar audio:", err);
        setPlayingAyat(null);
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

  const filteredSurah = surahs.filter(
    (s) =>
      s.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
      s.arti.toLowerCase().includes(search.toLowerCase()) ||
      String(s.nomor) === search
  );

  if (mode === "detail") {
    return (
      <div className="px-4 pt-10 pb-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setMode("list");
              if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current = null;
              }
              setPlayingAyat(null);
            }}
            className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Kembali"
          >
            ←
          </button>
          {selectedSurah && (
            <div>
              <h1 className="text-xl font-bold text-slate-100">{selectedSurah.namaLatin}</h1>
              <p className="text-xs text-slate-400">
                {selectedSurah.jumlahAyat} ayat · {selectedSurah.tempatTurun} · {selectedSurah.arti}
              </p>
            </div>
          )}
        </div>

        {loadingDetail && (
          <div className="space-y-4">
            <div className="skeleton h-32 w-full rounded-2xl" />
            <div className="skeleton h-48 w-full rounded-2xl animate-pulse" />
          </div>
        )}

        {selectedSurah && (
          <>
            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowLatin(!showLatin)}
                className={`badge cursor-pointer ${showLatin ? "badge-success" : "bg-white/5 text-slate-500"}`}
              >
                Latin
              </button>
              <button
                onClick={() => setShowTerjemah(!showTerjemah)}
                className={`badge cursor-pointer ${showTerjemah ? "badge-blue" : "bg-white/5 text-slate-500"}`}
              >
                Terjemah
              </button>
            </div>

            {/* Word popup */}
            {selectedWord && (
              <div className="glass-card p-4 border border-gold-500/30 animate-fade-in-up">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-arabic text-2xl text-gold-400 mb-1">{selectedWord}</p>
                    <p className="text-xs text-slate-400">Koreksi makhraj per-kata sedang dikembangkan</p>
                  </div>
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Ayat List */}
              <div className="space-y-5">
              {/* Bismillah card if not Surah Al-Tawbah and not Al-Fatihah (since Al-Fatihah ayat 1 is Bismillah) */}
              {selectedSurah.nomor !== 1 && selectedSurah.nomor !== 9 && (
                  <div className="glass-card p-6 text-center">
                  <p className="font-arabic text-2xl text-slate-100 leading-loose">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              )}

              {selectedSurah.ayat.map((a) => {
                const words = a.teksArab.split(" ");
                return (
                  <div key={a.nomorAyat} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400">
                        {a.nomorAyat}
                      </div>
                      <button
                        onClick={() => playAudio(a)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          playingAyat === a.nomorAyat
                            ? "bg-brand-600 text-white animate-pulse-glow"
                            : "glass-card text-slate-400 hover:text-brand-400"
                        }`}
                        aria-label={`Putar ayat ${a.nomorAyat}`}
                      >
                        {playingAyat === a.nomorAyat ? "⏸" : "▶"}
                      </button>
                    </div>

                    {/* Arabic text with clickable words */}
                    <p className="font-arabic text-3xl text-right leading-loose text-slate-100 mb-4 select-none" dir="rtl">
                      {words.map((w, idx) => (
                        <span
                          key={idx}
                          onClick={() => setSelectedWord(w)}
                          className="hover:text-gold-400 cursor-pointer transition-colors px-0.5 inline-block"
                        >
                          {w}
                        </span>
                      ))}
                    </p>

                    {showLatin && (
                      <p className="text-xs text-slate-400 italic mb-2 leading-relaxed">{a.teksLatin}</p>
                    )}
                    {showTerjemah && (
                      <p className="text-xs text-slate-300 leading-relaxed">{a.teksIndonesia}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Al-Qur&#39;an Digital</h1>
        <p className="text-sm text-slate-400 mt-2">Mushaf interaktif dengan audio dan tajwid</p>
      </div>

      {/* Search */}
      <input
        type="search"
        id="search-surah"
        placeholder="Cari surah (contoh: Yasin, Al-Fatihah, 36)..."
        className="input-field text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        /* Surah List */
        <div className="space-y-3">
          {filteredSurah.map((s, i) => (
            <button
              key={s.nomor}
              id={`surah-${s.nomor}`}
              onClick={() => openSurah(s.nomor)}
              className={`glass-card glass-card-hover w-full p-5 flex items-center gap-4 text-left animate-fade-in-up stagger-${Math.min(
                i + 1,
                5
              )}`}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400 flex-shrink-0">
                {s.nomor}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-sm">{s.namaLatin}</span>
                  <span className="font-arabic text-xl text-slate-300 ml-2">{s.nama}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {s.jumlahAyat} ayat · {s.arti}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
