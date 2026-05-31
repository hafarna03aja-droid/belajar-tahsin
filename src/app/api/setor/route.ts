import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const body = await req.json();
    const { surah, ayat, audioDataUrl, durasiDetik, catatan } = body;

    if (!surah || !ayat || !audioDataUrl) {
      return NextResponse.json(
        { error: "Nama surah, nomor ayat, dan audio wajib diisi." },
        { status: 400 }
      );
    }

    if (typeof durasiDetik !== "number" || durasiDetik <= 0) {
      return NextResponse.json(
        { error: "Durasi rekaman tidak valid." },
        { status: 400 }
      );
    }

    // SLA: 24 jam dari sekarang
    const slaDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const submission = await prisma.audioSubmission.create({
      data: {
        userId: session.user.id,
        surah,
        ayat,
        // In production, upload audioDataUrl to cloud storage and store the URL.
        // For now we store a placeholder indicating it was received.
        audioUrl: audioDataUrl.startsWith("blob:") ? `[blob:${surah}_${ayat}]` : audioDataUrl,
        durasiDetik,
        catatanUstadz: catatan ?? null,
        status: "menunggu",
        slaDeadline,
      },
    });

    return NextResponse.json(
      { success: true, submissionId: submission.id, slaDeadline: slaDeadline.toISOString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SETOR_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const submissions = await prisma.audioSubmission.findMany({
      where: { userId: session.user.id },
      orderBy: { submittedAt: "desc" },
      take: 20,
      select: {
        id: true,
        surah: true,
        ayat: true,
        durasiDetik: true,
        status: true,
        slaDeadline: true,
        catatanUstadz: true,
        submittedAt: true,
        reviewedAt: true,
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("[SETOR_GET_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
