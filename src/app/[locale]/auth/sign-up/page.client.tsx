'use client';

import { Button, Card, CardBody, Divider, Image } from '@heroui/react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SEO_CONFIG } from '@/app';
import { GoogleIcon } from '@/components/icons/google';
import { signInWithGoogle } from '@/lib/auth-client';

export function SignUpPageClient() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (error) {
      console.error('Google注册失败:', error);
      setError(t('auth.googleSignUpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
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
          alt="Sign-up background image"
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

      {/* Right side - Sign up form */}
      <div
        className="flex items-center justify-center p-4 md:p-8"
      >
        <div className="w-full max-w-md space-y-4">
          <div
            className="space-y-4 text-center md:text-left"
          >
            <h2 className="text-3xl font-bold">{t('auth.signUpTitle')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('auth.signUpSubtitle')}
            </p>
          </div>

          <Card className="py-4">
            <CardBody className="pt-2">
              <div className="space-y-4">
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="bordered"
                    className="flex items-center gap-2"
                    disabled={loading}
                    onClick={handleBackToHome}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {t('NotFound.backToHome')}
                  </Button>
                  <Button
                    className="flex items-center gap-2"
                    disabled={loading}
                    onClick={handleGoogleSignUp}
                  >
                    <GoogleIcon className="h-5 w-5" />
                    {t('auth.google')}
                  </Button>
                </div>

                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <Divider className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('auth.orContinueWith')}
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {t('auth.alreadyHaveAccount')}
                  {' '}
                  <Link
                    className="text-primary underline-offset-4 hover:underline"
                    href="/auth/sign-in"
                  >
                    {t('auth.signInLink')}
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
