import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (process.env.ENABLE_AUTH !== "true") {
    return;
  }

  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/real-estate") || nextUrl.pathname.startsWith("/accounting") || nextUrl.pathname.startsWith("/projects") || nextUrl.pathname.startsWith("/settlements") || nextUrl.pathname.startsWith("/reports") || nextUrl.pathname.startsWith("/settings");

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};