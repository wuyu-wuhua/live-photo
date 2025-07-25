import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Live Photo - AI image editing platform',
  description: 'Professional AI image editing platform, supporting image coloring, video generation and more',
  icons: {
    icon: '/assets/image/logo.png',
    shortcut: '/assets/image/logo.png',
    apple: '/assets/image/logo.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}