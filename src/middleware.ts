import { NextResponse, NextRequest } from 'next/server';
import {verifySessionToken} from "@/lib/auth";
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    if (pathname === '/admin/login' || pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const cookie = req.cookies.get('admin_auth');
    if (!(await verifySessionToken(cookie?.value))) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};


