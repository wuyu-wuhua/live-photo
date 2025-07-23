'use client';

import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type TtsPlayerProps = {
  initialText?: string;
  className?: string;
};

export default function TtsPlayer({ initialText = '', className = '' }: TtsPlayerProps) {
  const t = useTranslations('tts');
  const [text, setText] = useState(initialText);
  const [voices, setVoices] = useState<Record<string, string>>({});
  const [selectedVoice, setSelectedVoice] = useState('zh-CN-XiaoxiaoNeural');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 获取可用语音列表
  useEffect(() => {
    async function fetchVoices() {
      try {
        const response = await fetch('/api/tts');
        const data: any = await response.json();

        if (data.success && data.data.voices) {
          setVoices(data.data.voices);
        } else {
                  setError(t('getVoicesFailed'));
        toast.error(t('getVoicesFailed'));
        }
      } catch (err) {
        setError(t('getVoicesError'));
        toast.error(t('getVoicesError'));
        console.error('获取语音列表错误:', err);
      }
    }

    fetchVoices();
  }, [t]);

  // 处理播放状态变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  // 生成语音
  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
              setError(t('pleaseEnterText'));
        toast.error(t('pleaseEnterText'));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
        }),
      });

      const data: any = await response.json();

      if (data.success && data.data.audioUrl) {
        setAudioUrl(data.data.audioUrl);
        toast.success(t('generateSuccess'));
        // 自动播放
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch((err) => {
            console.error('自动播放失败:', err);
            toast.error(t('autoPlayFailed'));
          });
        }
      } else {
                  setError(data.error || t('generateFailed'));
          toast.error(data.error || t('generateFailed'));
      }
    } catch (err) {
              setError(t('requestFailed'));
        toast.error(t('requestFailed'));
      console.error('生成语音错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 播放/暂停控制
  const togglePlay = () => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('播放失败:', err);
        setError(t('playFailed'));
        toast.error(t('playFailed'));
      });
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="mb-4">
        <label htmlFor="tts-text" className="block text-lg font-medium mb-2">
                      {t('enterText')}
        </label>
        <textarea
          id="tts-text"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          value={text}
          onChange={e => setText(e.target.value)}
                      placeholder={t('enterTextPlaceholder')}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="voice-select" className="block text-lg font-medium mb-2">
                      {t('selectVoice')}
        </label>
        <select
          id="voice-select"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedVoice}
          onChange={e => setSelectedVoice(e.target.value)}
        >
          {Object.entries(voices).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerateSpeech}
          disabled={isLoading || !text.trim()}
          className={`px-6 py-3 rounded-md ${
            isLoading || !text.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium flex items-center gap-2`}
        >
          {isLoading
            ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" />
                  {t('generating')}
                </>
              )
            : (
                <>
                  <Icon icon="mdi:microphone" />
                  {t('generateSpeech')}
                </>
              )}
        </button>

        {audioUrl && (
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={`px-6 py-3 rounded-md ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium flex items-center gap-2`}
          >
            {isPlaying
              ? (
                  <>
                    <Icon icon="mdi:pause" />
                    {t('pause')}
                  </>
                )
              : (
                  <>
                    <Icon icon="mdi:play" />
                    {t('play')}
                  </>
                )}
          </button>
        )}
      </div>

      {audioUrl && (
        <audio ref={audioRef} className="hidden">
                        <track kind="captions" src="" label={t('captions')} />
          <source src={audioUrl} type="audio/mpeg" />
                      {t('browserNotSupported')}
        </audio>
      )}
    </div>
  );
}
