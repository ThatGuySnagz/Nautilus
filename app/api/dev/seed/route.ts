import { NextResponse } from 'next/server';
import { seedDatabase } from '@/app/lib/seed';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database seeded (or already had data).' });
  } catch (e: any) {
    console.error('Seed error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
