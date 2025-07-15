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

  // 👉 Se o usuário está logado
  if (session) {
    const profile = JSON.parse(session)?.profile?.toLowerCase();

    // Se estiver logado e tentando acessar página de login, redireciona pro dashboard
    if (isExactAuthPage) {
      return NextResponse.redirect(new URL(`/${profile}/dashboard`, req.url));
    }

    // Redireciona para o dashboard correto caso vá para "/dashboard"
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/${profile}/dashboard`, req.url));
    }

    // Permite continuar normalmente
    return NextResponse.next();
  }

  // 👉 Se o usuário NÃO estiver logado e estiver tentando acessar rota protegida
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

// ✨ Ativa o middleware para todas as rotas, exceto estáticos
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};
