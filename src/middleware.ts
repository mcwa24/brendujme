import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";

const isProduction = process.env.NODE_ENV === "production";

export function middleware(request: NextRequest) {
  if (isProduction && request.nextUrl.protocol === "http:") {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = "https:";
    const redirect = NextResponse.redirect(httpsUrl, 308);
    applySecurityHeaders(redirect, request);
    return redirect;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, request);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
