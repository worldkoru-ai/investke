import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getDb } from "@/lib/db"; // your MySQL connection

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = getDb();

        // 1. Get user by email
        const [rows]: any = await db.query(
          "SELECT * FROM users WHERE email = ?",
          [credentials?.email]
        );
        const user = rows[0];

        if (!user) return null;

        // 2. Compare password
        const isValid = await compare(credentials!.password, user.password);
        if (!isValid) return null;

        // 3. Return user object
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          walletBalance: Number(user.wallet_balance),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const, // can also use "database" for DB-backed sessions
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    // include wallet balance in JWT
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.walletBalance = user.walletBalance;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // session object sent to frontend
      session.user.id = token.sub;
      session.user.walletBalance = token.walletBalance;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
