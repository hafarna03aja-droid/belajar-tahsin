import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ustadz") {
      return NextResponse.json({ error: "Akses ditolak. Hanya untuk Ustadz." }, { status: 403 });
    }

    const submissions = await prisma.audioSubmission.findMany({
      where: {
        status: { in: ["menunggu", "diproses"] },
      },
      orderBy: { submittedAt: "asc" }, // Oldest first
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("[USTADZ_SUBMISSIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ustadz") {
      return NextResponse.json({ error: "Akses ditolak. Hanya untuk Ustadz." }, { status: 403 });
    }

    const ustadzId = session.user.id;
    const body = await req.json();
    const { submissionId, catatanUstadz, audioBalasanUrl } = body;

    if (!submissionId || !catatanUstadz) {
      return NextResponse.json(
        { error: "submissionId dan catatanUstadz wajib diisi." },
        { status: 400 }
      );
    }

    // Verify submission exists
    const submission = await prisma.audioSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      return NextResponse.json({ error: "Setoran tidak ditemukan." }, { status: 404 });
    }

    if (submission.status === "selesai") {
      return NextResponse.json({ error: "Setoran ini sudah dinilai." }, { status: 400 });
    }

    // Update submission
    const updatedSubmission = await prisma.audioSubmission.update({
      where: { id: submissionId },
      data: {
        status: "selesai",
        catatanUstadz,
        audioBalasanUrl: audioBalasanUrl ?? null,
        reviewedAt: new Date(),
        ustadzId,
      },
    });

    // Award +50 points to the student for receiving a review
    await prisma.user.update({
      where: { id: submission.userId },
      data: {
        points: { increment: 50 },
      },
    });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("[USTADZ_REVIEW_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
