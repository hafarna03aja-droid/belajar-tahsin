const { PrismaClient } = require('../src/generated/prisma');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

async function main() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const relativePath = url.replace(/^file:/, "");
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const adapter = new PrismaBetterSqlite3({ url: absolutePath });
  const prisma = new PrismaClient({ adapter });

  console.log("Memulai seeding database...");

  // Clean existing data
  await prisma.quizSoal.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.audioSubmission.deleteMany({});
  await prisma.materi.deleteMany({});
  await prisma.kategori.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database dibersihkan.");

  // 1. Create Users
  const studentPassword = await bcrypt.hash("student123", 12);
  const ustadzPassword = await bcrypt.hash("ustadz123", 12);
  const adminPassword = await bcrypt.hash("admin123", 12);

  const student = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "student@quran.com",
      password: studentPassword,
      role: "student",
      level: "dasar",
      points: 1200,
      streak: 3,
    },
  });

  const ustadz = await prisma.user.create({
    data: {
      name: "Ustadz Ahmad Fauzi",
      email: "ustadz@quran.com",
      password: ustadzPassword,
      role: "ustadz",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin QuranEdutech",
      email: "admin@quran.com",
      password: adminPassword,
      role: "admin",
    },
  });

  console.log("Pengguna berhasil dibuat:", {
    student: student.email,
    ustadz: ustadz.email,
    admin: admin.email,
  });

  // 2. Create Kategori
  const katHijaiyah = await prisma.kategori.create({
    data: {
      nama: "Hijaiyah",
      level: "dasar",
      urutan: 1,
      icon: "أ",
    },
  });

  const katTahsin = await prisma.kategori.create({
    data: {
      nama: "Tahsin",
      level: "menengah",
      urutan: 2,
      icon: "📝",
    },
  });

  const katTajwid = await prisma.kategori.create({
    data: {
      nama: "Tajwid",
      level: "mahir",
      urutan: 3,
      icon: "🎓",
    },
  });

  console.log("Kategori berhasil dibuat.");

  // 3. Create Materi & QuizSoal
  // ─── HIJAIYAH MATERI ───
  const matAlif = await prisma.materi.create({
    data: {
      kategoriId: katHijaiyah.id,
      judul: "Huruf Alif (أ)",
      deskripsi: "Belajar melafalkan huruf Alif dengan makhraj yang benar.",
      kontenTeks: "Huruf Alif dilafalkan dari tenggorokan bagian bawah (Aqsal Halq). Bunyinya sama seperti huruf vokal 'A' pada kata 'Apel' dalam bahasa Indonesia. Pastikan suara keluar dengan jelas tanpa tertahan atau berdesis berlebihan.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // placeholder audio
      urutan: 1,
      nilaiMinKuis: 80,
    },
  });

  await prisma.quizSoal.createMany({
    data: [
      {
        materiId: matAlif.id,
        pertanyaan: "Di manakah letak makhraj huruf Alif (أ)?",
        opsiA: "Tenggorokan bagian bawah (Aqsal Halq)",
        opsiB: "Dua bibir rapat (Syafatain)",
        opsiC: "Rongga mulut (Al-Jauf)",
        opsiD: "Rongga hidung (Al-Khaisyum)",
        jawaban: "A",
        urutan: 1,
      },
      {
        materiId: matAlif.id,
        pertanyaan: "Bunyi huruf Alif mirip dengan pelafalan huruf vokal apa dalam bahasa Indonesia?",
        opsiA: "I",
        opsiB: "U",
        opsiC: "A",
        opsiD: "O",
        jawaban: "C",
        urutan: 2,
      },
    ],
  });

  const matBa = await prisma.materi.create({
    data: {
      kategoriId: katHijaiyah.id,
      judul: "Huruf Ba (ب)",
      deskripsi: "Belajar melafalkan huruf Ba dengan makhraj yang benar.",
      kontenTeks: "Huruf Ba dilafalkan dengan merapatkan kedua bibir (Syafatain). Ketika huruf Ba berharakat sukun (mati), ia harus dibaca memantul (Qalqalah Kubra/Sughra). Pastikan pantulannya terdengar bersih.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      urutan: 2,
      nilaiMinKuis: 80,
    },
  });

  await prisma.quizSoal.createMany({
    data: [
      {
        materiId: matBa.id,
        pertanyaan: "Bagaimana cara melafalkan huruf Ba (ب)?",
        opsiA: "Menyentuhkan ujung lidah ke gigi seri bawah",
        opsiB: "Merapatkan kedua bibir (Syafatain)",
        opsiC: "Mengeluarkan suara dari tenggorokan atas",
        opsiD: "Meniupkan udara lewat celah gigi",
        jawaban: "B",
        urutan: 1,
      },
      {
        materiId: matBa.id,
        pertanyaan: "Jika huruf Ba berharakat sukun (mati), hukum pantulannya disebut apa?",
        opsiA: "Ghunnah",
        opsiB: "Izhar",
        opsiC: "Qalqalah",
        opsiD: "Ikhfa",
        jawaban: "C",
        urutan: 2,
      },
    ],
  });

  const matTa = await prisma.materi.create({
    data: {
      kategoriId: katHijaiyah.id,
      judul: "Huruf Ta (ت)",
      deskripsi: "Belajar melafalkan huruf Ta dengan makhraj yang benar.",
      kontenTeks: "Huruf Ta dilafalkan dengan menyentuhkan ujung lidah ke pangkal gigi seri bagian atas. Pelafalan disertai dengan hembusan nafas tipis (sifat Hams) yang terdengar seperti desisan halus.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      urutan: 3,
      nilaiMinKuis: 80,
    },
  });

  // ─── TAHSIN MATERI ───
  const matMakhraj = await prisma.materi.create({
    data: {
      kategoriId: katTahsin.id,
      judul: "Makharijul Huruf (Makhraj)",
      deskripsi: "Pengenalan tempat keluar huruf Hijaiyah secara umum.",
      kontenTeks: "Makharijul huruf dibagi menjadi 5 tempat utama:\n1. Al-Jauf (rongga mulut)\n2. Al-Halq (tenggorokan)\n3. Al-Lisan (lidah)\n4. Asy-Syafatain (kedua bibir)\n5. Al-Khaisyum (rongga hidung).\nMemahami kelima area ini penting agar pengucapan huruf tidak tertukar.",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      urutan: 1,
      nilaiMinKuis: 80,
    },
  });

  // ─── TAJWID MATERI ───
  const matNunMati = await prisma.materi.create({
    data: {
      kategoriId: katTajwid.id,
      judul: "Hukum Nun Mati & Tanwin",
      deskripsi: "Belajar hukum bacaan Nun Sukun atau Tanwin ketika bertemu huruf Hijaiyah.",
      kontenTeks: "Hukum Nun mati dan Tanwin terbagi menjadi 4:\n1. Izhar Halqi (jelas, tanpa dengung)\n2. Idgham (melebur - Bighunnah dengan dengung / Bilaghunnah tanpa dengung)\n3. Iqlab (menukar suara Nun menjadi Mim dengan dengung)\n4. Ikhfa Haqiqi (samar-samar disertai dengung).",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      urutan: 1,
      nilaiMinKuis: 80,
    },
  });

  await prisma.quizSoal.createMany({
    data: [
      {
        materiId: matNunMati.id,
        pertanyaan: "Hukum Nun mati dibaca jelas saat bertemu huruf Izhar disebut...",
        opsiA: "Izhar Halqi",
        opsiB: "Ikhfa Haqiqi",
        opsiC: "Idgham Bighunnah",
        opsiD: "Iqlab",
        jawaban: "A",
        urutan: 1,
      },
      {
        materiId: matNunMati.id,
        pertanyaan: "Huruf berikut yang termasuk huruf Iqlab adalah...",
        opsiA: "Alif",
        opsiB: "Ba",
        opsiC: "Ta",
        opsiD: "Jim",
        jawaban: "B",
        urutan: 2,
      },
    ],
  });

  console.log("Materi & QuizSoal berhasil dibuat.");

  // 4. Create some initial progress for our demo student
  await prisma.progress.createMany({
    data: [
      {
        userId: student.id,
        materiId: matAlif.id,
        status: "lulus",
        nilaiKuis: 100,
        aiScore: 92.5,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        userId: student.id,
        materiId: matBa.id,
        status: "lulus",
        nilaiKuis: 80,
        aiScore: 85.0,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: student.id,
        materiId: matTa.id,
        status: "dalam_proses",
      },
    ],
  });

  // 5. Create some initial audio submissions for our demo student
  await prisma.audioSubmission.createMany({
    data: [
      {
        userId: student.id,
        surah: "Al-Fatihah",
        ayat: "1",
        audioUrl: "[blob:Al-Fatihah_1]",
        durasiDetik: 6,
        status: "selesai",
        slaDeadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        catatanUstadz: "Makhraj huruf Alif dan Ba sudah bagus, pelafalan tajwid di basmalah sempurna.",
        reviewedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        ustadzId: ustadz.id,
      },
      {
        userId: student.id,
        surah: "Al-Ikhlas",
        ayat: "1-4",
        audioUrl: "[blob:Al-Ikhlas_1-4]",
        durasiDetik: 15,
        status: "menunggu",
        slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("Progres & Setoran awal berhasil dibuat.");
  console.log("Seeding database selesai sukses!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Gagal melakukan seeding:", err);
  process.exit(1);
});
