import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchGscSites, GscApiError } from '@/lib/gsc/client';

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: 'Nicht angemeldet. Bitte zuerst mit Google verbinden.' },
      { status: 401 },
    );
  }

  if (session.error === 'RefreshTokenError') {
    return NextResponse.json(
      { error: 'Sitzung abgelaufen. Bitte erneut verbinden.' },
      { status: 403 },
    );
  }

  try {
    const sites = await fetchGscSites(session.accessToken);
    return NextResponse.json({ sites });
  } catch (error) {
    if (error instanceof GscApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error('GSC sites fetch error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Properties.' },
      { status: 500 },
    );
  }
}
