import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function requireRole(allowedRoles: Role[]) {
  const session = await auth();
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
}