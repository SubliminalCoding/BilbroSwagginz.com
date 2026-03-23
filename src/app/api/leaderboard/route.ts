import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT player_name, score, level_reached, cows_abducted, max_combo, played_at
      FROM leaderboard
      ORDER BY score DESC
      LIMIT 50
    `;
    return NextResponse.json(rows);
  } catch (e) {
    console.error("Leaderboard fetch error:", e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { player_name, score, level_reached, cows_abducted, max_combo } = body;

    if (!player_name || typeof score !== "number" || typeof level_reached !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const cleanName = String(player_name).slice(0, 20).replace(/[^\w\s\-!.]/g, "");
    if (score < 0 || level_reached < 1) {
      return NextResponse.json({ error: "Invalid score data" }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO leaderboard (player_name, score, level_reached, cows_abducted, max_combo)
      VALUES (${cleanName}, ${score}, ${level_reached}, ${cows_abducted || 0}, ${max_combo || 0})
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Leaderboard submit error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
