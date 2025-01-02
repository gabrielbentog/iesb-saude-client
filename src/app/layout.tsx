// app/layout.tsx
import { ReactNode } from 'react';
import { Inter } from "next/font/google"
import './globals.css';
import ToastProvider from "@/app/providers/ToastProvider"

const inter = Inter({ subsets: ["latin"] })


interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
