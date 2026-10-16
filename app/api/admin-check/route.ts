import { NextRequest, NextResponse } from "next/server";
import { requiresAdminPassword } from "@/lib/admin-access";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("ipds_admin")?.value;
  if (cookie === "1" || !await requiresAdminPassword()) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
