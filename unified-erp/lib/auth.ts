import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

import prisma from "./prisma";
import { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
      if (!dbUser) return token;
      token.role = dbUser.role;
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true",
});

/**
 * RBAC utility function
 * @param allowedRoles Array of roles that are allowed to access a resource.
 * @returns true if the current user's role is in the allowedRoles array.
 * @throws Error if user is not authenticated or does not have the required role.
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await auth();
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    // In a real app, you'd probably redirect or throw a specific error
    throw new Error("Forbidden");
  }
  return true;
}
