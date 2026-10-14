import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  let staffId = 'usr_staff_01';
  try {
    const staff = await prisma.profile.findFirst({
      where: { role: 'STAFF' },
    });
    if (staff) staffId = staff.id;
  } catch (e) {
    console.error('Failed to lookup staff profile', e);
  }

  const url = new URL('/admin?mode=staff', request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set('camprent_session', staffId, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
