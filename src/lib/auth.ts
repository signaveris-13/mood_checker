import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, upsert user to Supabase
      if (user) {
        const { data } = await supabase
          .from("users")
          .upsert(
            {
              email: user.email,
              name: user.name,
              image: user.image,
            },
            { onConflict: "email" }
          )
          .select("id")
          .single();

        if (data) {
          token.supabaseUserId = data.id;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.supabaseUserId) {
        (session.user as { id?: string }).id = token.supabaseUserId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
