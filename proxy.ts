import { NextRequest, NextResponse } from "next/server";

// Optimistic session check — full verification happens in each route/server component.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || pathname.startsWith("/api/auth") || pathname.startsWith("/api/waitlist")) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token");

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|hawk.png).*)"],
};
