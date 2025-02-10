// export { default } from 'next-auth/middleware'

// export const config = { matcher: [
//   '/dashboard',
//   '/app/:path*',
//   '/app/protected/:path*',
//   '/api/:path*'
// ]}


import { UserRole } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Parse the URL to get the pathname
    const pathname = request.nextUrl.pathname;

    // If the pathname starts with /protected and the user is not an admin, redirect to the home page
    if (
      pathname.startsWith('/admin') &&
      (!token || token.role !== UserRole.ADMIN)
    ) {
      console.log(`Unauthorized access attempt to ${pathname} by token:`, token);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Continue with the request if the user is an admin or the route is not protected
    return NextResponse.next();
  } catch (error) {
    console.error('Error retrieving token:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
