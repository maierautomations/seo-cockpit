import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';
import { DEFAULT_PAGE_TYPE_SETTINGS } from '@/lib/page-type-config';
import type { Json } from '@/types/database';

// GET: Load user settings
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: row, error } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();

  if (error || !row) {
    // No settings saved yet — return defaults
    return NextResponse.json({ settings: { pageTypeSettings: DEFAULT_PAGE_TYPE_SETTINGS } });
  }

  return NextResponse.json({ settings: row.settings });
}

// POST: Upsert user settings
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const body = (await request.json()) as { settings: Json };

  if (!body.settings || typeof body.settings !== 'object') {
    return NextResponse.json({ error: 'settings Objekt ist erforderlich.' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        settings: body.settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.error('Failed to upsert settings:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
