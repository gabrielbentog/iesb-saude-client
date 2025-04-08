'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false }); // Oculta o spinner se quiser

export default function NProgressHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("NProgress start triggered", { pathname, searchParams: searchParams.toString() });
    NProgress.start();
  
    const timeout = setTimeout(() => {
      console.log("NProgress done triggered");
      NProgress.done();
    }, 300);
  
    return () => {
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);
  

  return null;
}
