import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const HOME: Record<string, string> = { ADMIN: "/admin", TEACHER: "/guru", STUDENT: "/siswa" };
const AREA_ROLE: Record<string, string> = { admin: "ADMIN", guru: "TEACHER", siswa: "STUDENT" };

async function getRole(req: NextRequest) {
  const token = req.cookies.get("lms_session")?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return String(payload.role);
  } catch {
    return null;
  }
}

// Pemeriksaan cepat (optimistic) sebelum render; otorisasi final tetap di server (lib/auth.ts).
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await getRole(req);
  const area = pathname.split("/")[1];

  if (pathname === "/login") {
    // Sesi kedaluwarsa/dicabut di server: hapus cookie agar tidak terjadi pengalihan berulang
    if (req.nextUrl.searchParams.has("expired")) {
      const res = NextResponse.next();
      res.cookies.delete("lms_session");
      return res;
    }
    if (role && HOME[role]) return NextResponse.redirect(new URL(HOME[role], req.url));
    return NextResponse.next();
  }

  const required = AREA_ROLE[area];
  if (required) {
    if (!role) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== required) return NextResponse.redirect(new URL(HOME[role] ?? "/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/guru/:path*", "/siswa/:path*"],
};
