import { exec } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';

const execPromise = util.promisify(exec);

// 主要语音列表，这里包含了中文和一些常用语音
export const voiceList = {
  // 中文语音（普通话）
  'zh-CN-XiaoxiaoNeural': '小小 (女声)',
  'zh-CN-XiaoyiNeural': '小怡 (女声)',
  'zh-CN-YunjianNeural': '云健 (男声)',
  'zh-CN-YunxiNeural': '云希 (男声)',
  'zh-CN-YunxiaNeural': '云夏 (男声)',
  'zh-CN-YunyangNeural': '云扬 (男声)',

  // 中文方言
  'zh-CN-liaoning-XiaobeiNeural': '小北 (女声, 东北方言)',
  'zh-CN-shaanxi-XiaoniNeural': '小妮 (女声, 陕西方言)',

  // 粤语
  'zh-HK-HiuGaaiNeural': '晓佳 (女声, 粤语)',
  'zh-HK-HiuMaanNeural': '晓曼 (女声, 粤语)',
  'zh-HK-WanLungNeural': '云龙 (男声, 粤语)',

  // 台湾普通话
  'zh-TW-HsiaoChenNeural': '晓辰 (女声, 台湾)',
  'zh-TW-HsiaoYuNeural': '晓玉 (女声, 台湾)',
  'zh-TW-YunJheNeural': '云哲 (男声, 台湾)',

  // 英语
  'en-US-AnaNeural': 'Ana (美式英语, 女声)',
  'en-US-AriaNeural': 'Aria (美式英语, 女声)',
  'en-US-ChristopherNeural': 'Christopher (美式英语, 男声)',
  'en-US-EricNeural': 'Eric (美式英语, 男声)',
  'en-GB-LibbyNeural': 'Libby (英式英语, 女声)',
  'en-GB-RyanNeural': 'Ryan (英式英语, 男声)',
};

export type TTSParams = {
  text: string;
  voice?: string;
  rate?: string; // 语速，如 '+10%'
  volume?: string; // 音量，如 '+10%'
  pitch?: string; // 音调，如 '+10%'
};

class EdgeTTSService {
  private outputDir: string;

  constructor() {
    // 确保输出目录存在
    this.outputDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 生成语音文件
   * @param params TTS参数
   * @returns 语音文件URL
   */
  async generateSpeech(params: TTSParams): Promise<string> {
    const {
      text,
      voice = 'zh-CN-XiaoxiaoNeural',
      rate = '0%',
      volume = '+0%',
      pitch = '0%',
    } = params;

    // 创建唯一的文件名
    const hash = createHash('md5').update(text + voice + rate + volume + pitch).digest('hex');
    const fileName = `${hash}.mp3`;
    const filePath = path.join(this.outputDir, fileName);

    // 如果文件已存在，直接返回URL
    if (fs.existsSync(filePath)) {
      return `/audio/${fileName}`;
    }

    try {
      // 格式化命令参数
      const escapedText = text.replace(/"/g, '\\"');
      const command = `edge-tts --voice "${voice}" --text "${escapedText}" --rate="${rate}" --volume="${volume}" --pitch="${pitch}" --write-media "${filePath}"`;

      // 执行命令
      await execPromise(command);

      // 返回生成的音频文件的URL
      return `/audio/${fileName}`;
    } catch (error) {
      console.error('生成语音失败:', error);
      throw new Error('生成语音失败');
    }
  }

  /**
   * 获取可用的语音列表
   */
  getVoiceList() {
    return voiceList;
  }
}

export default new EdgeTTSService();
