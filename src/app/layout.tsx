import { AuthContextProvider } from '@/app/auth';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';
import { UserWrapper } from './userWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Planning poker clone',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'bg-stone-50')}>
        <AuthContextProvider>
          <UserWrapper>{children}</UserWrapper>
        </AuthContextProvider>
      </body>
    </html>
  );
}
