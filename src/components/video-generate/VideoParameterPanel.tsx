'use client';

import { useTranslations } from 'next-intl';

export interface VideoParameterPanelProps {
  referenceImage: string;
}

export function VideoParameterPanel({ referenceImage }: VideoParameterPanelProps) {
  const t = useTranslations('resultPanel');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h5 style={{ marginBottom: 8 }}>{t('referenceImage')}</h5>
        {referenceImage ? (
          <img src={referenceImage} alt={t('referenceImage')} style={{ width: '100%', borderRadius: 8, marginBottom: 24 }} />
        ) : (
          <div style={{ marginBottom: 24 }}>{t('noResultImage')}</div>
        )}
      </div>
    </div>
  );
}
