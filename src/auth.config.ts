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
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole) ?? "CUSTOMER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
