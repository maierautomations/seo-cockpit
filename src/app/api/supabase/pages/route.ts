import { NextResponse } from 'next/server';

// DEPRECATED: GSC data is now live-only (memory), not persisted to Supabase.
// This route is kept as a no-op for backward compatibility.
export async function GET() {
  return NextResponse.json({ pages: [], overview: null, importId: null });
}
