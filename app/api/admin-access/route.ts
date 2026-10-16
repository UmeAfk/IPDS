import { NextRequest, NextResponse } from "next/server";
import { requiresAdminPassword, setAdminPasswordRequired } from "@/lib/admin-access";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ passwordRequired: await requiresAdminPassword() });
}

export async function PATCH(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (await requiresAdminPassword() && req.cookies.get("ipds_admin")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { passwordRequired } = await req.json();
    if (typeof passwordRequired !== "boolean") {
      return NextResponse.json({ error: "Choose a valid password setting." }, { status: 400 });
    }
    if (passwordRequired && !process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Configure an admin password before enabling protection." }, { status: 400 });
    }
    await setAdminPasswordRequired(passwordRequired);
    return NextResponse.json({ passwordRequired });
  } catch {
    return NextResponse.json({ error: "Could not save admin access. Please try again." }, { status: 500 });
  }
}
