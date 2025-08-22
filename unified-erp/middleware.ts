import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Return early if auth is disabled
  if (process.env.ENABLE_AUTH === "false") {
    return;
  }

  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/real-estate") || nextUrl.pathname.startsWith("/accounting") || nextUrl.pathname.startsWith("/projects") || nextUrl.pathname.startsWith("/settlements") || nextUrl.pathname.startsWith("/reports") || nextUrl.pathname.startsWith("/settings");

  if (isProtectedRoute) {
    if (isLoggedIn) {
      return;
    }
    return Response.redirect(new URL("/login", nextUrl));
  } else if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
