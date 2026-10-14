import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, name, phone, address } = body;

    const cookieStore = await cookies();

    // 1. Check or Login with Google account
    if (action === 'check-or-login') {
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email wajib diisi' }, { status: 400 });
      }

      // Check existing profile (including demo Dimas alias)
      const existingProfile = await prisma.profile.findFirst({
        where: {
          OR: [
            { email },
            email === 'dimas.pratama@gmail.com' || email === 'dimas@gmail.com'
              ? { id: 'usr_cust_01' }
              : { email },
          ],
        },
        include: { customer: true },
      });

      if (existingProfile) {
        // Account exists -> Log in directly
        cookieStore.set('camprent_session', existingProfile.id, {
          path: '/',
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({
          success: true,
          status: 'LOGGED_IN',
          user: {
            id: existingProfile.id,
            email: existingProfile.email,
            name: existingProfile.name,
            role: existingProfile.role,
            customer: existingProfile.customer,
          },
        });
      }

      // Account does not exist yet -> Proceed to Step 2 (completion)
      return NextResponse.json({
        success: true,
        status: 'NEEDS_COMPLETION',
        email,
        name: name || email.split('@')[0],
      });
    }

    // 2. Complete Google Registration (Step 2: phone & address)
    if (action === 'complete-register') {
      if (!email || !phone || !address) {
        return NextResponse.json(
          { success: false, error: 'Email, No. WhatsApp, dan Alamat wajib diisi' },
          { status: 400 }
        );
      }

      // Check if user registered in the meantime
      let profile = await prisma.profile.findUnique({
        where: { email },
        include: { customer: true },
      });

      if (!profile) {
        const newProfileId = 'usr_goog_' + Date.now();
        profile = await prisma.profile.create({
          data: {
            id: newProfileId,
            email,
            name: name || email.split('@')[0],
            role: 'CUSTOMER',
            customer: {
              create: {
                phone,
                address,
              },
            },
          },
          include: { customer: true },
        });
      } else if (!profile.customer) {
        await prisma.customer.create({
          data: {
            profileId: profile.id,
            phone,
            address,
          },
        });
        profile = await prisma.profile.findUnique({
          where: { id: profile.id },
          include: { customer: true },
        });
      }

      if (!profile) {
        return NextResponse.json({ success: false, error: 'Gagal membuat akun' }, { status: 500 });
      }

      cookieStore.set('camprent_session', profile.id, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        status: 'REGISTERED',
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          customer: profile.customer,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak valid' }, { status: 400 });
  } catch (err: any) {
    console.error('Google Auth API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
