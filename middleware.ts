import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect sub-paths under /admin, not /admin itself (login page)
  if (pathname.startsWith("/admin/")) {
    const cookie = req.cookies.get("ipds_admin")?.value;
    if (cookie !== "1") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
