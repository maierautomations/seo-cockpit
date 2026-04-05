import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';
import type {} from '@/types/auth';

// NextAuth is now ONLY used for the GSC API OAuth flow.
// User authentication is handled by Supabase Auth.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          scope:
            'openid email https://www.googleapis.com/auth/webmasters.readonly',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // First GSC connection — save tokens
        token = {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        };

        // Persist GSC tokens to gsc_connections table
        try {
          const supabase = createServiceClient();
          // Read the profile UUID from the cookie set by GscConnectButton
          const cookieStore = await cookies();
          const profileId = cookieStore.get('gsc_profile_id')?.value;
          token.gscProfileId = profileId;
          if (profileId && account.access_token && account.refresh_token) {
            await supabase.from('gsc_connections').upsert(
              {
                user_id: profileId,
                google_access_token: account.access_token,
                google_refresh_token: account.refresh_token,
              },
              { onConflict: 'user_id' },
            );
          }
        } catch (error) {
          console.error('Failed to persist GSC tokens:', error);
        }

        return token;
      }

      // Token still valid
      if (token.expires_at && Date.now() < token.expires_at * 1000) {
        return token;
      }

      // Token expired — refresh
      if (!token.refresh_token) {
        token.error = 'RefreshTokenError';
        return token;
      }

      try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token,
          }),
        });

        const tokensOrError = await response.json();

        if (!response.ok) throw tokensOrError;

        const newTokens = tokensOrError as {
          access_token: string;
          expires_in: number;
          refresh_token?: string;
        };

        const refreshedToken = {
          ...token,
          access_token: newTokens.access_token,
          expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
          refresh_token: newTokens.refresh_token ?? token.refresh_token,
        };

        // Update gsc_connections with refreshed tokens
        try {
          const profileId = token.gscProfileId as string | undefined;
          if (profileId) {
            const supabase = createServiceClient();
            await supabase
              .from('gsc_connections')
              .update({
                google_access_token: newTokens.access_token,
                ...(newTokens.refresh_token
                  ? { google_refresh_token: newTokens.refresh_token }
                  : {}),
              })
              .eq('user_id', profileId);
          }
        } catch {
          // Non-critical — tokens are still in JWT
        }

        return refreshedToken;
      } catch (error) {
        console.error('Error refreshing access_token', error);
        token.error = 'RefreshTokenError';
        return token;
      }
    },
    async session({ session, token }) {
      session.accessToken = token.access_token;
      session.error = token.error;
      return session;
    },
  },
});
