import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

/**
 * Cấu hình dùng chung — không import Prisma/bcrypt (Edge / middleware được).
 * Providers thật nằm trong `src/lib/auth.ts`.
 */
export default {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/account/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { name?: string | null };
        if (s.name !== undefined) token.name = s.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole) ?? "CUSTOMER";
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
