'use client';

import { Button } from '@heroui/react';
import { Facebook, Github, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { SEO_CONFIG } from '@/app';
import { cn } from '@/lib/cn';
import { useContactModal } from './FloatingContactModal';

export function Footer({ className }: { className?: string }) {
  const t = useTranslations();
  const { openContactModal } = useContactModal();

  return (
    <footer className={cn('border-t border-divider bg-background', className)}>
      <div
        className={`
          container mx-auto max-w-7xl px-4 py-12
          sm:px-6
          lg:px-8
        `}
      >
        <div
          className={`
            grid grid-cols-1 gap-8
            md:grid-cols-4
          `}
        >
          <div className="space-y-4">
            <Link className="flex items-center gap-2" href="/">
              <span
                className={`
                  bg-gradient-to-r from-primary to-primary/70 bg-clip-text
                  text-xl font-bold tracking-tight text-transparent
                `}
              >
                {SEO_CONFIG.name}
              </span>
            </Link>
            <p className="text-default-500 text-sm">
              {t('footer.brandDescription')}
            </p>
            <div className="flex space-x-4">
              <Button
                className="h-8 w-8 rounded-full"
                isIconOnly
                variant="light"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                isIconOnly
                variant="light"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                isIconOnly
                variant="light"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                isIconOnly
                variant="light"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
              <Button
                className="h-8 w-8 rounded-full"
                isIconOnly
                variant="light"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('footer.shop')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.allProducts')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.audio')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.wearables')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.smartphones')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.laptops')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="/about"
                >
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.press')}
                </Link>
              </li>
              <li>
                <button
                  className={`
                    text-default-500
                    hover:text-foreground
                    text-left
                  `}
                  onClick={openContactModal}
                >
                  {t('footer.contact')}
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="#"
                >
                  {t('footer.shippingReturns')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="/refund-policy"
                >
                  {t('footer.refundPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="/privacy"
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  className={`
                    text-default-500
                    hover:text-foreground
                  `}
                  href="/terms"
                >
                  {t('footer.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-divider pt-8">
          <div
            className={`
              flex flex-col items-center justify-between gap-4
              md:flex-row
            `}
          >
            <p className="text-default-500 text-sm">
              {t('footer.copyright', { year: new Date().getFullYear(), name: SEO_CONFIG.name })}
            </p>
            <div className="text-default-500 flex items-center gap-4 text-sm">
              <Link className="hover:text-foreground" href="/privacy">
                {t('footer.privacy')}
              </Link>
              <Link className="hover:text-foreground" href="/terms">
                {t('footer.terms')}
              </Link>
              <Link className="hover:text-foreground" href="#">
                {t('footer.cookies')}
              </Link>
              <Link className="hover:text-foreground" href="#">
                {t('footer.sitemap')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
