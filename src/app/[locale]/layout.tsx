import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import React from 'react';
import { ContactModalProvider } from '@/components/FloatingContactModal';
import { Footer } from '@/components/footer';
import Navbar from '@/components/Navigation';
import { Toaster } from '@/components/ui/sonner';
import { RootProvider } from '@/provider/RootProvider';

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  const messages = await getMessages();

  return (
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
  );
}
