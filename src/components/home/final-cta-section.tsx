'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';

export function FinalCTASection() {
  const t = useTranslations();
  const { user, loading } = useUser();
  const router = useRouter();

  const handleGetStartButtonClick = () => {
    if (loading) {
      // 如果还在加载用户状态，等待一下
      return;
    }

    if (!user) {
      // 用户未登录，显示提示并跳转到登录页面
      toast.info('请先登录后再使用照片上色功能');
      router.push('/auth/sign-in');
    } else {
      // 用户已登录，跳转到生成页面
      router.push('/generate');
    }
  };

  return (
    <section
      className={`
        from-primary to-primary/80 py-20
        dark:bg-black
      `}
    >
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-center">
          <h2
            className={`
              text-3xl font-bold text-primary-foreground
              lg:text-4xl
              dark:text-white
            `}
          >
            {t('common.millionPhotosColorized')}
          </h2>
          <Button
            className="px-8 py-4 text-lg font-semibold"
            color="secondary"
            size="lg"
            onPress={handleGetStartButtonClick}
            isDisabled={loading}
          >
            {t('common.getStartNow')}
          </Button>
        </div>
      </div>
    </section>
  );
}
