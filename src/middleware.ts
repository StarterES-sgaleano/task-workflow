import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup');

  // If user is authenticated
  if (user) {
    // and on an auth page, redirect to the dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If user is not authenticated
  else {
    // and not on an auth page or the landing page, redirect to login
    if (!isAuthPage && url.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
