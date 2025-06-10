'use client';

import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Navbar as HeroUINavbar, Link, link as linkStyles, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from '@heroui/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/Icon';
import { ThemeSwitch } from '@/components/theme-switch';
import { siteConfig } from '@/config/site';
import { useUser } from '@/hooks/useUser';
import { signOut } from '@/lib/auth-client';

export const Navbar = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/');
    }
  };
  // const searchInput = (...);

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit">{tCommon('appName')}</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map(item => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: 'foreground' }),
                  'data-[active=true]:text-primary data-[active=true]:font-medium',
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          {/* <Link isExternal aria-label="Twitter" href={siteConfig.links.twitter}>
            <Icon icon="mdi:twitter" className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Discord" href={siteConfig.links.discord}>
            <Icon icon="ic:baseline-discord" className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <Icon icon="mdi:github" className="text-default-500" />
          </Link> */}
          <ThemeSwitch />
        </NavbarItem>
        {/* <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem> */}
        {/* <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.sponsor}
            startContent={<Icon icon="heroicons:heart-solid" className="text-danger" />}
            variant="flat"
          >
            Sponsor
          </Button>
        </NavbarItem> */}

        {/* 用户认证区域 */}
        <NavbarItem className="flex gap-2">
          {loading
            ? (
                <div className="w-8 h-8 rounded-full bg-default-200 animate-pulse" />
              )
            : user
              ? (
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Avatar
                        className="transition-transform"
                        size="sm"
                        src={user.user_metadata?.avatar_url}
                        name={user.user_metadata?.full_name || user.email}
                      />
                    </DropdownTrigger>
                    <DropdownMenu aria-label={t('login')} variant="flat">
                      <DropdownItem key="profile" className="h-14 gap-2">
                        <p className="font-semibold">{t('login')}</p>
                        <p className="font-semibold">{user.email}</p>
                      </DropdownItem>
                      <DropdownItem key="dashboard" as={NextLink} href="/dashboard">
                        {t('dashboard')}
                      </DropdownItem>
                      <DropdownItem key="settings" as={NextLink} href="/settings">
                        {tCommon('edit')}
                      </DropdownItem>
                      <DropdownItem key="logout" color="danger" onClick={handleSignOut}>
                        {t('logout')}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                )
              : (
                  <div className="flex gap-2">
                    <Button
                      as={NextLink}
                      href="/auth/sign-in"
                      variant="ghost"
                      size="sm"
                    >
                      {t('login')}
                    </Button>
                    <Button
                      as={NextLink}
                      href="/auth/sign-up"
                      color="primary"
                      size="sm"
                    >
                      {t('signup')}
                    </Button>
                  </div>
                )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <Icon icon="mdi:github" className="text-default-500" />
        </Link>
        <ThemeSwitch />

        {/* 移动端用户认证 */}
        {loading
          ? (
              <div className="w-6 h-6 rounded-full bg-default-200 animate-pulse" />
            )
          : user
            ? (
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      className="transition-transform"
                      size="sm"
                      src={user.user_metadata?.avatar_url}
                      name={user.user_metadata?.full_name || user.email}
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label={t('login')} variant="flat">
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <p className="font-semibold">{t('login')}</p>
                      <p className="font-semibold">{user.email}</p>
                    </DropdownItem>
                    <DropdownItem key="dashboard" as={NextLink} href="/dashboard">
                      {t('dashboard')}
                    </DropdownItem>
                    <DropdownItem key="settings" as={NextLink} href="/settings">
                      {tCommon('edit')}
                    </DropdownItem>
                    <DropdownItem key="logout" color="danger" onClick={handleSignOut}>
                      {t('logout')}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )
            : (
                <Button
                  as={NextLink}
                  href="/auth/sign-in"
                  variant="ghost"
                  size="sm"
                >
                  {t('login')}
                </Button>
              )}

        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {/* {searchInput} */}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? 'primary'
                    : index === siteConfig.navMenuItems.length - 1
                      ? 'danger'
                      : 'foreground'
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}

          {/* 移动端菜单中的认证选项 */}
          {!user && (
            <>
              <NavbarMenuItem>
                <Button
                  as={NextLink}
                  href="/auth/sign-in"
                  variant="ghost"
                  className="w-full justify-start"
                >
                  {t('login')}
                </Button>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Button
                  as={NextLink}
                  href="/auth/sign-up"
                  color="primary"
                  className="w-full justify-start"
                >
                  {t('signup')}
                </Button>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};

export default Navbar;
