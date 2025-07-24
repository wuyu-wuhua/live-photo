'use client';

import { Button, Card, CardBody, Divider, Image } from '@heroui/react';

import Link from 'next/link';
import { useState } from 'react';
import { SEO_CONFIG } from '@/app';
import { GitHubIcon } from '@/components/icons/github';
import { GoogleIcon } from '@/components/icons/google';
import { signInWithGitHub, signInWithGoogle } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';

export function SignUpPageClient() {
  const t = useTranslations();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGitHubSignUp = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithGitHub();
      if (error) {
        setError(error.message);
      }
    } catch (error) {
      console.error('GitHub注册失败:', error);
      setError(t('auth.githubSignUpFailed'));
    } finally {
      setLoading(false);
    }
  };

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
                  className="flex items-center gap-2"
                  disabled={loading}
                  onClick={handleGitHubSignUp}
                >
                  <GitHubIcon className="h-5 w-5" />
                    {t('auth.github')}
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
