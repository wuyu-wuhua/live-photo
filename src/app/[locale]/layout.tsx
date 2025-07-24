import type { ReactNode } from 'react';
import clsx from 'clsx';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import React from 'react';
import { ContactModalProvider } from '@/components/FloatingContactModal';
import { Footer } from '@/components/footer';
import Navbar from '@/components/Navigation';
import { Toaster } from '@/components/ui/sonner';
import { fontSans } from '@/config/fonts';
import { RootProvider } from '@/provider/RootProvider';
import '@/styles/globals.css';

type Props = {
  children: ReactNode;
};

// export async function generateMetadata(): Promise<Metadata> {
//   const t = await getTranslations('LocaleLayout');

//   return {
//     title: t('title'),
//   };
// }

export default async function RootLayout({ children }: Props) {
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <RootProvider>
            <ContactModalProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ContactModalProvider>
            <Toaster />
          </RootProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
