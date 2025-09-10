import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Protect all /admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
        const token = request.cookies.get("next-auth.session-token")?.value;
        if (!token) {
            // Redirect to the sign-in page
            const signInUrl = new URL("/api/auth/signin", request.url);
            signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
            return NextResponse.redirect(signInUrl);
        }
    }
    return NextResponse.next();
}