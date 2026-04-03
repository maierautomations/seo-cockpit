import 'next-auth';
import 'next-auth/jwt';

// NextAuth types — GSC-only OAuth flow.
// User authentication is handled by Supabase Auth.
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: 'RefreshTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
    error?: 'RefreshTokenError';
    gscProfileId?: string;
  }
}
