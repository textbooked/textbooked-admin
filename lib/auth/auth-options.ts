import { SignJWT } from "jose";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, profile }) {
      if (profile && typeof profile === "object") {
        const oauthProfile = profile as Record<string, unknown>;
        token.sub = resolveNonEmptyString(token.sub) ?? readString(oauthProfile, ["sub", "id"]);
        token.email = resolveNonEmptyString(token.email) ?? readString(oauthProfile, ["email"]);
        token.name = resolveNonEmptyString(token.name) ?? readString(oauthProfile, ["name"]);
        token.picture =
          resolveNonEmptyString(token.picture) ?? readString(oauthProfile, ["picture", "image"]);
      }

      const subject = resolveNonEmptyString(token.sub);
      const email = resolveNonEmptyString(token.email)?.toLowerCase();

      if (!subject || !email) {
        throw new Error("Google profile is missing required claims (sub/email).");
      }

      const nextAuthSecret = resolveNonEmptyString(process.env.NEXTAUTH_SECRET);
      if (!nextAuthSecret) {
        throw new Error("Missing NEXTAUTH_SECRET.");
      }

      const now = Math.floor(Date.now() / 1000);
      const shouldMintApiToken =
        typeof token.apiToken !== "string" ||
        typeof token.apiTokenExp !== "number" ||
        token.apiTokenExp - now <= 60;

      if (shouldMintApiToken) {
        const expiresAt = now + 30 * 60;
        const key = new TextEncoder().encode(nextAuthSecret);

        token.apiToken = await new SignJWT({
          sub: subject,
          email,
          name: resolveNonEmptyString(token.name) ?? undefined,
          picture: resolveNonEmptyString(token.picture) ?? undefined,
        })
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setIssuedAt(now)
          .setExpirationTime(expiresAt)
          .setIssuer("textbooked-admin")
          .setAudience("textbooked-api")
          .sign(key);

        token.apiTokenExp = expiresAt;
      }

      return token;
    },
    async session({ session, token }) {
      session.apiToken = typeof token.apiToken === "string" ? token.apiToken : undefined;

      if (session.user) {
        session.user.email = resolveNonEmptyString(token.email) ?? session.user.email;
        session.user.name = resolveNonEmptyString(token.name) ?? session.user.name;
        session.user.image = resolveNonEmptyString(token.picture) ?? session.user.image;
      }

      return session;
    },
  },
};

function resolveNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function readString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = resolveNonEmptyString(source[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}
