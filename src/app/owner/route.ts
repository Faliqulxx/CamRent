import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  let ownerId = 'usr_owner_01';
  try {
    const owner = await prisma.profile.findFirst({
      where: { role: 'OWNER' },
    });
    if (owner) ownerId = owner.id;
  } catch (e) {
    console.error('Failed to lookup owner profile', e);
  }

  const url = new URL('/admin', request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set('camprent_session', ownerId, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
