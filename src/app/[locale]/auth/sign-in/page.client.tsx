'use client';

import { Button, Card, CardBody, Image } from '@heroui/react';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SEO_CONFIG } from '@/app';
import { GoogleIcon } from '@/components/icons/google';
import { signInWithGoogle } from '@/lib/auth-client';

export function SignInPageClient() {
  const t = useTranslations();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(t('auth.googleSignInFailed'));
        setLoading(false);
      }
      // OAuth会重定向，不需要手动设置loading为false
    } catch (err) {
      setError(t('auth.googleSignInFailed'));
      console.error(err);
      setLoading(false);
    }
  };



  return (
    <div
      className="grid h-screen w-screen md:grid-cols-2"
    >
      {/* Left side - Image */}
      <div
        className="relative hidden h-full w-full overflow-hidden md:block"
      >
        <Image
          isBlurred
          radius="none"
          alt="Sign-in background image"
          className="h-full w-full object-cover"
          src="https://plus.unsplash.com/premium_photo-1747748530197-d9eab242dc0f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"
        />
        <div className="absolute bottom-8 left-8 z-10 text-white">
          <h1 className="text-3xl font-bold">{SEO_CONFIG.name}</h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            {SEO_CONFIG.slogan}
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div
        className="flex items-center justify-center p-4 md:p-8"
      >
        <div className="w-full max-w-md space-y-4">
          <div
            className="space-y-4 text-center md:text-left"
          >
            <h2 className="text-3xl font-bold">{t('auth.signInTitle')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('auth.signInSubtitle')}
            </p>
          </div>

          <Card className="border-none shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardBody className="pt-6 pb-8">
              <div className="space-y-6">
                {error && (
                  <div className="text-sm font-medium text-destructive bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full h-14 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 font-medium"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                >
                  <GoogleIcon className="h-6 w-6" />
                  {loading ? t('auth.signingIn') : t('auth.signInWithGoogle')}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
