import { cookies } from 'next/headers';
import prisma from './prisma';

export type UserRole = 'OWNER' | 'STAFF' | 'CUSTOMER' | 'GUEST';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  customerId?: string | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('camprent_session');

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: sessionCookie.value },
      include: { customer: true },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      customerId: profile.customer?.id || null,
    };
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return null;
  }
}
