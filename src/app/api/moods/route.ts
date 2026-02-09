import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: { userId: string; date?: { gte?: string; lte?: string } } = { userId };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }

  const entries = await prisma.moodEntry.findMany({
    where,
    orderBy: { date: "asc" },
    select: { id: true, date: true, moodValue: true },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { date, moodValue } = body;

  if (!date || !moodValue || moodValue < 1 || moodValue > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Don't allow future dates
  const today = new Date().toISOString().split("T")[0];
  if (date > today) {
    return NextResponse.json({ error: "Cannot log mood for future dates" }, { status: 400 });
  }

  const entry = await prisma.moodEntry.upsert({
    where: { userId_date: { userId, date } },
    update: { moodValue },
    create: { userId, date, moodValue },
    select: { id: true, date: true, moodValue: true },
  });

  return NextResponse.json(entry);
}
