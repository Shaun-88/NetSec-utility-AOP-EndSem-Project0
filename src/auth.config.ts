import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth configuration for use in middleware and server runtime.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Allow public endpoints to pass through
      if (
        pathname === "/signin" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/tools") ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico"
      ) {
        return true;
      }

      // All protected app pages require authentication
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
      }
      return session;
    },
  },
  providers: [], // Populated in auth.ts with concrete providers
};
