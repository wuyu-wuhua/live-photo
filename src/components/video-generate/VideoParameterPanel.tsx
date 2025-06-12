'use client';

import type { FormUploadFile } from '@/components/upload/picture-card-form';
import type { ImageEditResult } from '@/types/database';
import { Button, Card, CardBody, CardHeader, Select, SelectItem, Spinner, Tab, Tabs } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Mic, Smile } from 'lucide-react';

import Image from 'next/image';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { PictureCardForm } from '@/components/upload/picture-card-form';

// Emoji template options
const EMOJI_TEMPLATE_OPTIONS = [
  { value: 'mengwa_kaixin', label: 'Happy Kid', description: 'Happy kid expression', icon: 'emojione:grinning-face-with-big-eyes' },
  { value: 'dagong_kaixin', label: 'Happy', description: 'Happy expression', icon: 'emojione:smiling-face-with-smiling-eyes' },
  { value: 'dagong_yangwang', label: 'Good', description: 'Good expression', icon: 'emojione:thumbs-up' },
  { value: 'jingdian_tiaopi', label: 'Playful', description: 'Playful expression', icon: 'emojione:winking-face-with-tongue' },
  { value: 'jingdian_deyi_1', label: 'Proud', description: 'Proud expression', icon: 'emojione:smiling-face-with-sunglasses' },
  { value: 'jingdian_qidai', label: 'Excited', description: 'Excited expression', icon: 'emojione:star-struck' },
  { value: 'mengwa_dengyan', label: 'Wide-eyed', description: 'Wide-eyed expression', icon: 'emojione:face-with-open-mouth' },
  { value: 'mengwa_jidong', label: 'Thrilled', description: 'Thrilled expression', icon: 'emojione:grinning-face-with-star-eyes' },
  { value: 'dagong_kunhuo', label: 'Confused', description: 'Confused expression', icon: 'emojione:confused-face' },
  { value: 'dagong_zhuakuang', label: 'Crazy', description: 'Crazy expression', icon: 'emojione:face-with-symbols-on-mouth' },
  { value: 'mengwa_kun_1', label: 'Sleepy', description: 'Sleepy expression', icon: 'emojione:sleepy-face' },
  { value: 'jingdian_landuo_1', label: 'Lazy', description: 'Lazy expression', icon: 'emojione:sleeping-face' },
  { value: 'jingdian_xianqi', label: 'Disgusted', description: 'Disgusted expression', icon: 'emojione:face-with-rolling-eyes' },
  { value: 'jingdian_lei', label: 'Tired', description: 'Tired expression', icon: 'emojione:weary-face' },
  { value: 'mengwan_gandong', label: 'Touched', description: 'Touched expression', icon: 'emojione:smiling-face-with-tear' },
  { value: 'dagong_weixiao', label: 'Smile', description: 'Smile expression', icon: 'emojione:slightly-smiling-face' },
  { value: 'dagong_ganji', label: 'Grateful', description: 'Grateful expression', icon: 'emojione:folded-hands' },
];

type VideoParameterPanelProps = {
  imageData: ImageEditResult | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  videoType: 'emoji' | 'liveportrait';
  audioUrl: string;
  drivenId: string;
  hasEnoughCredits?: boolean;
  onVideoTypeChange: (type: 'emoji' | 'liveportrait') => void;
  onAudioUrlChange: (url: string) => void;
  onDrivenIdChange: (id: string) => void;
  onGenerate?: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
};

export function VideoParameterPanel({
  imageData,
  isLoading,
  isGenerating,
  error,
  videoType,
  drivenId,
  hasEnoughCredits = true,
  onVideoTypeChange,
  onAudioUrlChange,
  onDrivenIdChange,
  onGenerate,
}: VideoParameterPanelProps) {
  const [audioFiles, setAudioFiles] = useState<FormUploadFile[]>([]);

  // Handle audio file upload
  const handleAudioChange = (files: FormUploadFile[]) => {
    setAudioFiles(files);
  };

  // Get required credits for current video type - fixed at 3 credits
  const getRequiredCredits = () => {
    return 3; // Fixed at 3 credits for all video types
  };

  return (
    <div className="h-fit space-y-6">
      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Image information */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">Reference Image</h3>
        </CardHeader>
        <CardBody>
          {isLoading
            ? (
                <div className="flex items-center justify-center p-6">
                  <Spinner size="sm" />
                </div>
              )
            : imageData
              ? (
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={imageData.source_image_url || ''}
                        alt="Reference Image"
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <span className="block text-gray-500 dark:text-gray-400">
                          Emoji Video Compatible
                        </span>
                        <span className={`font-medium ${imageData.emoji_compatible ? 'text-green-600' : 'text-red-600'}`}>
                          {imageData.emoji_compatible ? 'Supported' : 'Not Supported'}
                        </span>
                      </div>
                      <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <span className="block text-gray-500 dark:text-gray-400">
                          Lipsync Video Compatible
                        </span>
                        <span className={`font-medium ${imageData.liveportrait_compatible ? 'text-green-600' : 'text-red-600'}`}>
                          {imageData.liveportrait_compatible ? 'Supported' : 'Not Supported'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              : (
                  <div className="text-center p-6 text-gray-500">
                    No result image available
                  </div>
                )}
        </CardBody>
      </Card>

      {/* Video type selection */}
      <div className="space-y-2">
        <Label htmlFor="video-type" className="text-sm font-medium">
          Video Type
        </Label>
        <Tabs
          selectedKey={videoType}
          onSelectionChange={key => onVideoTypeChange(key as 'emoji' | 'liveportrait')}
          fullWidth
          size="lg"
          color="primary"
        >
          <Tab
            key="emoji"
            title={(
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4" />
                <span>Emoji Video</span>
              </div>
            )}
            isDisabled={!imageData?.emoji_compatible}
          >
            <div className=" space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create an animated emoji video using your image. Select an expression template below.
              </p>

              {/* Emoji template selection */}
              <div className="space-y-2">
                <Select
                  label="Emoji Video"
                  placeholder="Select an emoji template"
                  selectedKeys={[drivenId]}
                  onSelectionChange={(keys) => {
                    const selectedId = Array.from(keys)[0] as string;
                    onDrivenIdChange(selectedId);
                  }}
                  isDisabled={!imageData?.emoji_compatible}
                  renderValue={() => {
                    const selectedOption = EMOJI_TEMPLATE_OPTIONS.find(option => option.value === drivenId);
                    return selectedOption
                      ? (
                          <div className="flex items-center gap-2">
                            <Icon icon={selectedOption.icon} width="20" height="20" />
                            {selectedOption.label}
                          </div>
                        )
                      : null;
                  }}
                >
                  {EMOJI_TEMPLATE_OPTIONS.map(option => (
                    <SelectItem key={option.value} description={option.description}>
                      <div className="flex items-center gap-2">
                        <Icon icon={option.icon} width="20" height="20" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </Tab>
          <Tab
            key="liveportrait"
            title={(
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span>Lipsync Video</span>
              </div>
            )}
            isDisabled={!imageData?.liveportrait_compatible}
          >
            <div className="p-3 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a talking head video that syncs with your audio. Upload an audio file below.
              </p>

              {/* Audio upload */}
              <div className="space-y-2">
                <Label htmlFor="audio-upload" className="text-sm font-medium">
                  Audio File
                  <span className="text-danger ml-1">*</span>
                </Label>
                <PictureCardForm
                  value={audioFiles}
                  onChange={handleAudioChange}
                  maxCount={1}
                  className="w-full"
                  onUploadComplete={(result) => {
                    if (result.success) {
                      if (result.file?.url) {
                        onAudioUrlChange(result.file.url);
                      }
                    }
                  }}
                  onUploadError={(error, file) => {
                    console.error('Upload failed', error, file);
                  }}
                />
                <p className="text-xs text-default-500">
                  Supported formats: MP3, WAV, M4A. Maximum duration: 30 seconds.
                </p>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Credit consumption notice */}
      {imageData && ((videoType === 'emoji' && imageData.emoji_compatible) || (videoType === 'liveportrait' && imageData.liveportrait_compatible)) && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-400">This operation will consume credits:</span>
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {getRequiredCredits()}
              {' '}
              Credits
            </span>
          </div>
        </div>
      )}

      {/* Generate button */}
      {imageData && ((videoType === 'emoji' && imageData.emoji_compatible) || (videoType === 'liveportrait' && imageData.liveportrait_compatible)) && (
        <Button
          color="primary"
          size="lg"
          className="w-full"
          isLoading={isGenerating}
          isDisabled={isGenerating || (videoType === 'liveportrait' && !audioFiles.length) || !hasEnoughCredits}
          onPress={onGenerate}
        >
          {isGenerating ? 'Generating...' : !hasEnoughCredits ? 'Insufficient Credits' : 'Start Generate'}
        </Button>
      )}

      {/* Compatibility notice */}
      {imageData && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {!imageData.emoji_compatible && !imageData.liveportrait_compatible && (
            <p className="text-red-500">
              This image is not compatible with any video generation features.
            </p>
          )}
          {videoType === 'emoji' && !imageData.emoji_compatible && (
            <p className="text-red-500">
              This image is not compatible with emoji video generation.
            </p>
          )}
          {videoType === 'liveportrait' && !imageData.liveportrait_compatible && (
            <p className="text-red-500">
              This image is not compatible with lipsync video generation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
