import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Route /staff -> Switch to Staff and redirect to /admin?mode=staff
  if (pathname === '/staff') {
    const url = new URL('/admin?mode=staff', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set('camprent_session', 'usr_staff_01', {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  // 2. Route /owner -> Switch to Owner and redirect to /admin
  if (pathname === '/owner') {
    const url = new URL('/admin', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set('camprent_session', 'usr_owner_01', {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  // 3. Route /customer -> Switch to Customer (Dimas) and redirect to /
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

  // 4. Route /admin
  if (pathname === '/admin') {
    const isStaffMode = searchParams.get('mode') === 'staff';
    const currentSession = request.cookies.get('camprent_session')?.value;

    if (isStaffMode) {
      if (currentSession !== 'usr_staff_01') {
        const url = new URL('/admin?mode=staff', request.url);
        const response = NextResponse.redirect(url);
        response.cookies.set('camprent_session', 'usr_staff_01', {
          path: '/',
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }
    } else {
      // Switching to or accessing as OWNER
      if (currentSession !== 'usr_owner_01') {
        const url = new URL('/admin', request.url);
        const response = NextResponse.redirect(url);
        response.cookies.set('camprent_session', 'usr_owner_01', {
          path: '/',
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/staff', '/owner', '/customer'],
};
