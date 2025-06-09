'use client';

import type { IconProps as IconifyIconProps } from '@iconify/react';
import { Icon as IconifyIcon } from '@iconify/react';
import { cn } from '@/lib/utils';

export type IconProps = {
  /**
   * Icon name from Iconify
   * @example "mdi:home" | "heroicons:home" | "lucide:home"
   */
  icon: string;
  /**
   * Icon size in pixels or CSS units
   * @default 24
   */
  size?: number | string;
  /**
   * Additional CSS classes
   */
  className?: string;
} & Omit<IconifyIconProps, 'icon'>;

/**
 * Icon component using Iconify
 *
 * @example
 * ```tsx
 * <Icon icon="mdi:home" size={24} />
 * <Icon icon="heroicons:user" className="text-blue-500" />
 * <Icon icon="lucide:settings" size="1.5rem" />
 * ```
 */
export function Icon({
  icon,
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <IconifyIcon
      icon={icon}
      width={size}
      height={size}
      className={cn('inline-block', className)}
      {...props}
    />
  );
}

export default Icon;
