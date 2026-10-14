import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentSession = request.cookies.get('camprent_session')?.value;
  const isAdminOrStaff = currentSession === 'usr_owner_01' || currentSession === 'usr_staff_01';

  // 1. Route /staff -> redirect to /admin/login?role=staff
  if (pathname === '/staff') {
    const url = new URL('/admin/login?role=staff', request.url);
    return NextResponse.redirect(url);
  }

  // 2. Route /admin/login
  if (pathname === '/admin/login') {
    // If already logged in as admin/staff, redirect to /admin
    if (isAdminOrStaff) {
      const url = new URL('/admin', request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. Protected /admin routes (e.g. /admin, /admin/rentals, /admin/inventory, etc.)
  if (pathname.startsWith('/admin')) {
    if (!isAdminOrStaff) {
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4. Route /customer -> Switch to Customer (Dimas) and redirect to /
  if (pathname === '/customer') {
    const url = new URL('/', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set('camprent_session', 'usr_cust_01', {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/staff', '/customer'],
};
