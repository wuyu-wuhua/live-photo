import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import Script from 'next/script';
import { fontSans } from '@/config/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Live Photo - AI image editing platform',
  description: 'Professional AI image editing platform, supporting image coloring, video generation and more',
  icons: {
    icon: '/assets/image/logo.png',
    shortcut: '/assets/image/logo.png',
    apple: '/assets/image/logo.png',
  },
  verification: {
    google: 's-8aRGLxfYDPvrF4FgFPTCn0sDRRx0wqsl-Sdq4aqa4',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6D67DS58NY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6D67DS58NY');
          `}
        </Script>
        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "skr0caixh5");
          `}
        </Script>
      </head>
      <body
        className={clsx(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
