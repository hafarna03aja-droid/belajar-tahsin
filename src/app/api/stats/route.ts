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

    // Fetch user points, streak, and level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, streak: true, level: true },
    });

    // Count completed materials
    const completedMateriCount = await prisma.progress.count({
      where: { userId, status: "lulus" },
    });

    // Count total audio submissions
    const submissionCount = await prisma.audioSubmission.count({
      where: { userId },
    });

    return NextResponse.json({
      points: user?.points ?? 0,
      streak: user?.streak ?? 0,
      level: user?.level ?? "dasar",
      completedMateriCount,
      submissionCount,
    });
  } catch (error) {
    console.error("[STATS_API_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
