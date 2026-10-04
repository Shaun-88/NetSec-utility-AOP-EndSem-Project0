import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { ensureUserProfile } from "./db/queries/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (user?.id) {
        const displayName = user.name || user.email?.split("@")[0] || "Security Agent";
        await ensureUserProfile(user.id, displayName);
        
        // Log authentication event
        try {
          const { saveToolHistory } = await import("./db/queries/history");
          const crypto = await import("crypto");
          const emailHash = crypto.createHash("sha256").update(user.email || "unknown").digest("hex").substring(0, 8).toUpperCase();
          const clientInfo = { browser: "System", os: "System", device: "System", agentHash: `OP-${emailHash}` };
          await saveToolHistory(user.id, "SYSTEM_LOGIN", { _clientContext: clientInfo, status: "SUCCESS" }, "AUTH_GATEWAY");
        } catch (e) {
          console.error("Failed to log auth event:", e);
        }
      }
      return true;
    },
  },
});
