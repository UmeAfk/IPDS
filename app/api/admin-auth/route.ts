import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

// ── Rate limiting (in-memory — resets on server restart) ──────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (record && now < record.resetAt && record.count >= 10) return true;
  attempts.set(ip, {
    count: (record && now < record.resetAt ? record.count : 0) + 1,
    resetAt: now + 15 * 60 * 1000, // 15 minute window
  });
  return false;
}

// ── Secure admin password check ───────────────────────────────────────────────
//
//  Set ADMIN_PASSWORD_HASH in Vercel env vars (never store plain text).
//
//  To generate your hash, run this in your terminal:
//    node -e "const {createHash}=require('crypto'); console.log(createHash('sha256').update('YourPasswordHere').digest('hex'))"
//
//  Then add ADMIN_PASSWORD_HASH=<the output> to Vercel environment variables.
//
//  Falls back to ADMIN_PASSWORD (plain text) for local dev convenience only.
// ─────────────────────────────────────────────────────────────────────────────

function checkPassword(input: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const plain = process.env.ADMIN_PASSWORD;

  if (hash) {
    const inputHash = createHash("sha256").update(input).digest();
    const storedHash = Buffer.from(hash, "hex");
    if (inputHash.length !== storedHash.length) return false;
    return timingSafeEqual(inputHash, storedHash);
  }

  if (plain) {
    const inputBuf  = Buffer.from(input);
    const plainBuf  = Buffer.from(plain);
    if (inputBuf.length !== plainBuf.length) return false;
    return timingSafeEqual(inputBuf, plainBuf);
  }

  console.warn("⚠️  ADMIN_PASSWORD_HASH not set. Admin panel is locked. Add it to Vercel env vars.");
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (checkPassword(password)) {
      const response = NextResponse.json({ ok: true }, { status: 200 });
      response.cookies.set("ipds_admin", "1", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 8, // 8 hour session
        path: "/admin",
      });
      return response;
    }

    // Deliberate delay to slow down brute-force attempts
    await new Promise(r => setTimeout(r, 500));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
