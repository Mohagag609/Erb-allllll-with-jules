import { Role } from "@prisma/client";
import { type DefaultSession } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
     /** The user's role. */
    role: Role;
  }
}

declare module "next-auth/adapters" {
  /**
   * The user object that the adapter works with.
   * This extends the base AdapterUser to include the custom `role` field.
   */
  interface AdapterUser extends User {
    role: Role;
  }
}
