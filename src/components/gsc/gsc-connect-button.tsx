'use client';

import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function GscConnectButton() {
  const [loading, setLoading] = useState(false);

  function handleConnect() {
    setLoading(true);
    signIn('google', { callbackUrl: '/' });
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="group relative w-full max-w-lg mx-auto block rounded-2xl border border-signal/30 bg-gradient-to-b from-signal/[0.08] to-signal/[0.02] hover:from-signal/[0.14] hover:to-signal/[0.06] transition-all duration-300 p-8 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(52,211,153,0.08),transparent_60%)]" />

      <div className="relative flex flex-col items-center gap-4">
        {/* Google + GSC icon cluster */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center group-hover:bg-signal/15 group-hover:border-signal/30 group-hover:scale-105 transition-all duration-300">
            {loading ? (
              <Loader2 className="w-5 h-5 text-signal animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-base font-medium text-foreground">
            Mit Google Search Console verbinden
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Empfohlen — automatische Datenabfrage mit
            <br className="hidden sm:block" />
            korrekter Keyword-Zuordnung pro URL
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex items-center gap-4 mt-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <LockIcon className="w-3 h-3" />
            Nur Lesezugriff
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <ShieldIcon className="w-3 h-3" />
            OAuth 2.0
          </span>
        </div>
      </div>
    </button>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5L2.5 4v4c0 3.5 2.5 5.5 5.5 6.5 3-1 5.5-3 5.5-6.5V4L8 1.5z" />
      <path d="M5.5 8l2 2 3-3.5" />
    </svg>
  );
}
