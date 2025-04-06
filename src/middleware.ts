import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/auth');

  if (session) {
    const profile = JSON.parse(session)?.profile?.toLowerCase();

    // Se o usuário está tentando acessar login/cadastro, redireciona para a dashboard dele
    if (isAuthPage) {
      return NextResponse.redirect(new URL(`/${profile}/dashboard`, req.url));
    }

    // Exemplo: se for para /dashboard genérico, redireciona para o caminho do perfil
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/${profile}/dashboard`, req.url));
    }
  } else {
    // Se o usuário NÃO está logado e tenta acessar rota protegida
    const isProtectedRoute = pathname.startsWith('/paciente') || pathname.startsWith('/gestor');
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
