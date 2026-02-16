import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "./supabase";

const missingEnvVars: string[] = [];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    missingEnvVars.push(name);
    console.error(
      `[auth] Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env and fill in the values.`
    );
    return "";
  }
  return value;
}

const googleClientId = requireEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = requireEnv("GOOGLE_CLIENT_SECRET");

if (missingEnvVars.length > 0) {
  console.error(
    `[auth] The following env vars are missing: ${missingEnvVars.join(", ")}. ` +
      `Google sign-in will not work until they are configured.`
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, upsert user to Supabase
      if (user) {
        const { data, error } = await supabase
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

        if (error) {
          console.error("[auth] Supabase user upsert failed:", error.message);
        }

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
    error: "/auth/error",
  },
};
