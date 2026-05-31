import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all categories with their materials and quizzes
    const categories = await prisma.kategori.findMany({
      orderBy: { urutan: "asc" },
      include: {
        materi: {
          orderBy: { urutan: "asc" },
          include: {
            quizSoal: {
              orderBy: { urutan: "asc" },
            },
          },
        },
      },
    });

    // Fetch user progress for these materials
    const userProgress = await prisma.progress.findMany({
      where: { userId },
    });

    const progressMap = new Map(
      userProgress.map((p) => [p.materiId, { status: p.status, score: p.nilaiKuis, aiScore: p.aiScore }])
    );

    // Map categories to include completion counts and materials with dynamic status
    const result = categories.map((cat) => {
      let completedCount = 0;
      
      const mappedMateri = cat.materi.map((mat) => {
        const prog = progressMap.get(mat.id);
        const status = prog?.status ?? "belum"; // "belum" | "dalam_proses" | "lulus"
        
        if (status === "lulus") {
          completedCount++;
        }

        return {
          id: mat.id,
          judul: mat.judul,
          deskripsi: mat.deskripsi,
          videoUrl: mat.videoUrl,
          kontenTeks: mat.kontenTeks,
          audioUrl: mat.audioUrl,
          urutan: mat.urutan,
          nilaiMinKuis: mat.nilaiMinKuis,
          status,
          score: prog?.score ?? null,
          aiScore: prog?.aiScore ?? null,
          quizSoal: mat.quizSoal,
        };
      });

      return {
        id: cat.id,
        nama: cat.nama,
        level: cat.level,
        urutan: cat.urutan,
        icon: cat.icon,
        totalMateri: cat.materi.length,
        selesai: completedCount,
        materi: mappedMateri,
      };
    });

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("[MATERI_API_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
