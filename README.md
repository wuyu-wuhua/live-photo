# Live Photo - AI图像处理平台

一个基于Next.js的AI图像处理平台，支持多种图像编辑功能。

## 功能特性

- 🎨 **AI图像上色**: 使用302.AI的黑白照片上色功能
- 🖼️ **图像编辑**: 支持多种图像处理功能
- 💳 **积分系统**: 完整的积分消费和管理
- 🔐 **用户认证**: Supabase身份验证
- 💰 **支付集成**: Stripe支付系统
- 🌐 **多语言**: 支持中英文
- 📱 **响应式设计**: 适配各种设备

## 环境变量配置

### 必需的环境变量

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe配置
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# 阿里云DashScope配置
DASHSCOPE_API_KEY=your_dashscope_api_key

# 302.AI配置 (新增)
API_302AI_KEY=your_302ai_api_key
```

### 302.AI API配置

要使用黑白照片上色功能，您需要：

1. 注册302.AI账号: https://302.ai
2. 获取API密钥
3. 在`.env.local`文件中添加：
   ```env
   API_302AI_KEY=your_302ai_api_key
   ```

## 安装和运行

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── dashscope/     # 阿里云DashScope API
│   │   └── 302ai/         # 302.AI API (新增)
│   └── [locale]/          # 国际化页面
├── components/            # React组件
├── hooks/                 # 自定义Hooks
├── lib/                   # 工具库
├── services/              # 服务层
└── types/                 # TypeScript类型定义
```

## API接口

### 302.AI黑白照片上色

- **端点**: `/api/302ai/colorize`
- **方法**: `POST`
- **参数**:
  - `image`: 图片文件 (multipart/form-data)
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "task_id": "任务ID",
      "result_image_url": "上色后的图片URL",
      "credit_cost": 6,
      "processing_time_ms": 5000
    },
    "message": "黑白照片上色成功"
  }
  ```

## 积分系统

- 每次黑白照片上色消耗6积分
- 支持积分购买和订阅
- 失败任务自动退款

## 技术栈

- **前端**: Next.js 15, React, TypeScript
- **UI**: HeroUI, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **支付**: Stripe
- **AI服务**: 阿里云DashScope, 302.AI
- **文件存储**: Supabase Storage

## 许可证

MIT License
