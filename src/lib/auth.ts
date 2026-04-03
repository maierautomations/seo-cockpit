import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createServiceClient } from '@/lib/supabase/server';
import type {} from '@/types/auth';

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
            'openid email profile https://www.googleapis.com/auth/webmasters.readonly',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // First-time login — save tokens
        token = {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        };

        // Upsert Supabase profile on login
        try {
          const supabase = createServiceClient();
          const email = token.email as string;

          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

          if (existing) {
            token.supabaseUserId = existing.id;
          } else {
            const { data: created } = await supabase
              .from('profiles')
              .insert({
                id: crypto.randomUUID(),
                email,
                display_name: (token.name as string) ?? null,
                avatar_url: (token.picture as string) ?? null,
              })
              .select('id')
              .single();
            token.supabaseUserId = created?.id;
          }
        } catch (error) {
          console.error('Failed to upsert Supabase profile:', error);
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

        return {
          ...token,
          access_token: newTokens.access_token,
          expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
          refresh_token: newTokens.refresh_token ?? token.refresh_token,
        };
      } catch (error) {
        console.error('Error refreshing access_token', error);
        token.error = 'RefreshTokenError';
        return token;
      }
    },
    async session({ session, token }) {
      session.accessToken = token.access_token;
      session.error = token.error;
      session.supabaseUserId = token.supabaseUserId;
      return session;
    },
  },
});
