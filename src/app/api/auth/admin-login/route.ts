import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // 1. Admin (Owner): username admin, pw admin
    if (cleanUser === 'admin' && cleanPass === 'admin') {
      let profile = await prisma.profile.findFirst({
        where: { role: 'OWNER' },
      });

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            id: 'usr_owner_01',
            email: 'owner@camprent.com',
            name: 'Budi Setiawan',
            role: 'OWNER',
          },
        });
      }

      const cookieStore = await cookies();
      cookieStore.set('camprent_session', profile.id, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
        },
        redirectUrl: '/admin',
      });
    }

    // 2. Staff: username staff, pw staff
    if (cleanUser === 'staff' && cleanPass === 'staff') {
      let profile = await prisma.profile.findFirst({
        where: { role: 'STAFF' },
      });

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            id: 'usr_staff_01',
            email: 'staff@camprent.com',
            name: 'Rian Saputra',
            role: 'STAFF',
          },
        });
      }

      const cookieStore = await cookies();
      cookieStore.set('camprent_session', profile.id, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
        },
        redirectUrl: '/admin',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Username atau password salah! Gunakan admin/admin atau staff/staff.',
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat login' },
      { status: 500 }
    );
  }
}
