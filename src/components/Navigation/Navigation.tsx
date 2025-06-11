'use client';

import {
  Button,
  Link as HeroLink,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Link } from '@/i18n/i18nConfig';
import { useSupabase } from '@/provider/SupabaseProvider';

export default function Navigation() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const { user, signOut } = useSupabase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { href: '/', label: t('home'), icon: 'heroicons:home' },
    { href: '/generate', label: t('generate'), icon: 'heroicons:sparkles' },
    { href: '/gallery', label: t('gallery'), icon: 'heroicons:photo' },
    { href: '/about', label: t('about'), icon: 'heroicons:information-circle' },
    { href: '/pricing', label: t('pricing'), icon: 'heroicons:currency-dollar' },
    { href: '/pathnames', label: t('pathnames'), icon: 'heroicons:link' },
    { href: '/todos', label: t('todos'), icon: 'heroicons:list-bullet' },
    { href: '/database', label: t('database'), icon: 'heroicons:circle-stack' },
    { href: '/file-upload', label: t('fileUpload'), icon: 'heroicons:cloud-arrow-up' },
    { href: '/icons', label: 'Icons', icon: 'heroicons:star' },
  ];

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      className="bg-white shadow-md"
      maxWidth="full"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/" className="font-bold text-inherit flex items-center gap-2">
            <Icon icon="heroicons:rocket-launch" size={24} className="text-primary" />
            NextJS Boilerplate
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map(item => (
          <NavbarItem key={item.href} isActive={pathname === item.href}>
            <HeroLink
              as={Link}
              href={item.href}
              color={pathname === item.href ? 'primary' : 'foreground'}
              className="w-full flex items-center gap-2"
            >
              <Icon icon={item.icon} size={16} />
              {item.label}
            </HeroLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <LanguageSwitcher />
        </NavbarItem>
        <NavbarItem>
          {user
            ? (
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => signOut()}
                  startContent={<Icon icon="heroicons:arrow-right-on-rectangle" size={16} />}
                >
                  Sign Out
                </Button>
              )
            : (
                <Button
                  as={Link}
                  href="/auth"
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="heroicons:user" size={16} />}
                >
                  {t('auth')}
                </Button>
              )}
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map(item => (
          <NavbarMenuItem key={item.href}>
            <HeroLink
              as={Link}
              href={item.href}
              color={pathname === item.href ? 'primary' : 'foreground'}
              className="w-full flex items-center gap-3"
              size="lg"
            >
              <Icon icon={item.icon} size={20} />
              {item.label}
            </HeroLink>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <div className="flex justify-center py-2">
            <LanguageSwitcher />
          </div>
        </NavbarMenuItem>
        <NavbarMenuItem>
          {user
            ? (
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => signOut()}
                  className="w-full justify-start"
                  startContent={<Icon icon="heroicons:arrow-right-on-rectangle" size={16} />}
                >
                  Sign Out
                </Button>
              )
            : (
                <Button
                  as={Link}
                  href="/auth"
                  color="primary"
                  variant="flat"
                  className="w-full justify-start"
                  startContent={<Icon icon="heroicons:user" size={16} />}
                >
                  {t('auth')}
                </Button>
              )}
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
