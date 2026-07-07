import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("ipds_admin")?.value;
  if (cookie !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids, category } = await req.json();
  if (!Array.isArray(ids) || !ids.length || !["ongoing", "key"].includes(category)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );

  const base = category === "key" ? 1000 : 0;
  const { error } = await supabase
    .from("projects")
    .upsert(
      ids.map((id: string, i: number) => ({ id, sort_order: base + i })),
      { onConflict: "id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
