import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  let customerId = 'usr_cust_01';
  try {
    const customer = await prisma.profile.findFirst({
      where: { role: 'CUSTOMER' },
    });
    if (customer) customerId = customer.id;
  } catch (e) {
    console.error('Failed to lookup customer profile', e);
  }

  const url = new URL('/', request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set('camprent_session', customerId, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
