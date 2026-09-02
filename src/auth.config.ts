import type { NextAuthConfig } from "next-auth"

export default {
  providers: [], // real providers live in auth.ts, kept out here to stay edge-safe
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      return isOnDashboard ? isLoggedIn : true
    },
  },
} satisfies NextAuthConfig