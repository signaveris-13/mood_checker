import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("mood_entries")
    .select("id, date, mood_value")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map snake_case DB columns to camelCase for frontend compatibility
  const entries = (data || []).map((row) => ({
    id: row.id,
    date: row.date,
    moodValue: row.mood_value,
  }));

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

  // Upsert: insert or update on conflict (user_id, date)
  const { data, error } = await supabase
    .from("mood_entries")
    .upsert(
      {
        user_id: userId,
        date,
        mood_value: moodValue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    )
    .select("id, date, mood_value")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    date: data.date,
    moodValue: data.mood_value,
  });
}
