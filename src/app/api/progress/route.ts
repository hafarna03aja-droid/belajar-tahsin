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

    const userId = session.user.id;
    const body = await req.json();
    const { materiId, status, nilaiKuis, aiScore } = body;

    if (!materiId || !status) {
      return NextResponse.json({ error: "materiId dan status wajib diisi." }, { status: 400 });
    }

    // Verify material exists
    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
    });
    if (!materi) {
      return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 444 });
    }

    // Check existing progress
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_materiId: { userId, materiId },
      },
    });

    const isFirstTimeLulus =
      status === "lulus" && (!existingProgress || existingProgress.status !== "lulus");

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_materiId: { userId, materiId },
      },
      update: {
        status,
        nilaiKuis: nilaiKuis !== undefined ? nilaiKuis : undefined,
        aiScore: aiScore !== undefined ? aiScore : undefined,
        completedAt: status === "lulus" ? new Date() : undefined,
      },
      create: {
        userId,
        materiId,
        status,
        nilaiKuis: nilaiKuis ?? null,
        aiScore: aiScore ?? null,
        completedAt: status === "lulus" ? new Date() : null,
      },
    });

    let pointsAwarded = 0;
    let streakUpdated = false;
    let currentStreak = 0;
    let currentPoints = 0;

    // If newly graduated/passed, award points and update streak
    if (isFirstTimeLulus) {
      pointsAwarded = 100;
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        const now = new Date();
        let newStreak = user.streak;

        if (user.lastActiveAt) {
          const lastActive = new Date(user.lastActiveAt);
          
          // Clear time to compare dates
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime();
          
          const diffDays = (todayDate - lastActiveDate) / (1000 * 60 * 60 * 24);

          if (diffDays === 1) {
            newStreak += 1;
            streakUpdated = true;
          } else if (diffDays > 1) {
            newStreak = 1;
            streakUpdated = true;
          }
        } else {
          newStreak = 1;
          streakUpdated = true;
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            points: { increment: pointsAwarded },
            streak: newStreak,
            lastActiveAt: now,
          },
        });

        currentStreak = updatedUser.streak;
        currentPoints = updatedUser.points;
      }
    } else {
      // Just update last active
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          lastActiveAt: new Date(),
        },
      });
      currentStreak = updatedUser.streak;
      currentPoints = updatedUser.points;
    }

    return NextResponse.json({
      success: true,
      progress,
      pointsAwarded,
      streakUpdated,
      currentPoints,
      currentStreak,
    });
  } catch (error) {
    console.error("[PROGRESS_API_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
