'use client';
import { HeroUIProvider } from '@heroui/system';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';
import { useRouter } from 'next/navigation';
import { SupabaseProvider } from './SupabaseProvider';

export type ProvidersProps = {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
};

export function RootProvider({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  return (
    <SupabaseProvider>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="theme"
          {...themeProps}
        >
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </SupabaseProvider>
  );
}
