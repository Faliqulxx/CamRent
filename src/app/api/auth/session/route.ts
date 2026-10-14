import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('camprent_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ user: null });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: sessionCookie.value },
      include: { customer: true },
    });

    if (!profile) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        customer: profile.customer,
      },
    });
  } catch (err) {
    console.error('Session error:', err);
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, email } = body;

    let targetProfile = null;
    if (email) {
      targetProfile = await prisma.profile.findUnique({
        where: { email },
        include: { customer: true },
      });
    } else if (role) {
      targetProfile = await prisma.profile.findFirst({
        where: { role },
        include: { customer: true },
      });
    }

    const cookieStore = await cookies();

    if (!targetProfile) {
      // Logout / Guest mode
      cookieStore.delete('camprent_session');
      return NextResponse.json({ success: true, user: null });
    }

    cookieStore.set('camprent_session', targetProfile.id, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: targetProfile.id,
        email: targetProfile.email,
        name: targetProfile.name,
        role: targetProfile.role,
        customer: targetProfile.customer,
      },
    });
  } catch (err) {
    console.error('Switch role error:', err);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
