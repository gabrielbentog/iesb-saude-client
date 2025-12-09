import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const pathname = req.nextUrl.pathname;

  const validAuthRoutes = ['/auth', '/auth/login', '/auth/cadastro', '/auth/esqueci-a-senha'];
  const isExactAuthPage = validAuthRoutes.includes(pathname);

  const isStaticFile =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/logos/');

  const isProtectedRoute = !isExactAuthPage && !isStaticFile;

  // Redireciona "/" para "/auth/login"
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Se o usuário está logado
  if (session) {
    const profile = JSON.parse(session)?.profile?.toLowerCase();

    if (isExactAuthPage) {
      return NextResponse.redirect(new URL(`/${profile}/dashboard`, req.url));
    }

    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/${profile}/dashboard`, req.url));
    }

    return NextResponse.next();
  }

  // Se o usuário NÃO estiver logado e estiver tentando acessar rota protegida
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};
