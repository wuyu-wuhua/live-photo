# Live Photo 项目 - Trae AI 对话规则

## 项目概述
这是一个基于 Next.js 15 + React 19 的现代化 Web 应用，主要功能包括图像编辑、视频生成、AI 动画制作等。项目使用 TypeScript、Supabase、Stripe 支付、HeroUI 组件库等技术栈。

## 核心技术栈规则

### 1. 框架与语言
- **必须使用 Next.js 15** 与 React 19
- **严格使用 TypeScript**，所有新文件必须是 `.ts` 或 `.tsx`
- 使用 **App Router** 架构，不使用 Pages Router
- 支持国际化 (i18n)，使用 `next-intl` 库
- 路由结构：`src/app/[locale]/` 支持多语言

### 2. UI 组件与样式
- **主要使用 HeroUI (@heroui/react)** 作为 UI 组件库
- 使用 **Tailwind CSS** 进行样式设计
- 图标使用 **Lucide React** 和 **@iconify/react**
- 动画使用 **Framer Motion**
- 遵循 **shadcn/ui** 的组件结构和命名规范
- 组件配置文件：`components.json`

### 3. 数据库与后端
- **必须使用 Supabase** 作为后端服务
- 数据库操作通过 `@supabase/supabase-js` 进行
- 使用 **Row Level Security (RLS)** 确保数据安全
- 所有数据库类型定义在 `src/types/database.ts` 中
- 数据库迁移文件在 `supabase/migrations/` 目录

### 4. 支付系统
- 使用 **Stripe** 处理支付
- 积分系统集成，支持多种交易类型
- 必须处理 webhook 事件
- 支付配置在环境变量中

## 代码组织规则

### 1. 目录结构
```
src/
├── app/[locale]/          # App Router 页面 (支持国际化)
│   ├── gallery/           # 图片画廊页面
│   ├── pricing/           # 定价页面
│   └── api/              # API 路由
├── components/            # 可复用组件
│   ├── ui/               # 基础 UI 组件
│   ├── generate/         # 生成相关组件
│   ├── upload/           # 上传组件
│   └── video-generate/   # 视频生成组件
├── hooks/                # 自定义 React Hooks
├── lib/                  # 工具函数和配置
├── services/             # 业务逻辑服务
├── types/                # TypeScript 类型定义
└── styles/               # 全局样式
```

### 2. 组件开发规则
- 组件必须使用 **函数式组件** 和 **React Hooks**
- 使用 **TypeScript 接口** 定义 Props
- 组件文件使用 **PascalCase** 命名
- 优先使用 HeroUI 组件，自定义组件放在 `components/ui/` 下
- 组件示例：`Modal`, `Button`, `Card`, `Spinner` 等

### 3. 状态管理
- 使用 **React Hooks** (useState, useEffect, useCallback 等)
- 复杂状态逻辑封装为自定义 Hooks
- 全局状态通过 **Context API** 管理
- 重要 Hooks：`useCredits`, `useUser`, `useDatabase`

### 4. 数据获取
- 使用 **Supabase Client** 进行数据操作
- 数据库操作封装在 `services/` 目录下
- 使用自定义 Hooks 管理数据状态
- 服务类：`UploadService`, `ImageEditResultService` 等

## 功能特定规则

### 1. 积分系统
- 所有消费功能必须检查用户积分余额
- 使用 `useCredits` Hook 管理积分状态
- 积分交易类型：`PURCHASE`, `SUBSCRIPTION`, `REFERRAL`, `BONUS`, `ADMIN_ADJUSTMENT`, `IMAGE_GENERATION`, `VIDEO_GENERATION`, `REFUND`, `EXPIRATION`, `PROMOTIONAL`
- 功能消费积分配置在 `FEATURE_COSTS` 中定义

### 2. 文件上传
- 使用 Supabase Storage 存储文件
- 支持图片和视频上传
- 必须验证文件类型和大小
- 使用 `react-images-uploading` 处理图片上传
- 上传服务：`fileUploadService.ts`

### 3. 视频处理
- 使用 `xgplayer-react` 作为视频播放器
- 支持多种视频格式和状态显示
- 异步处理视频生成任务
- 状态类型：`PENDING`, `RUNNING`, `SUCCEEDED`, `FAILED`

### 4. 国际化
- 所有用户界面文本必须支持多语言
- 使用 `next-intl` 进行国际化
- 翻译文件存放在 `messages/` 目录 (`en.json`, `zh.json`)
- 路由支持语言前缀：`/[locale]/`

## 安全与性能规则

### 1. 环境变量
- 敏感信息必须使用环境变量
- 使用 `@t3-oss/env-nextjs` 进行环境变量验证
- 客户端变量必须以 `NEXT_PUBLIC_` 开头
- 必需变量：`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 2. 类型安全
- 启用严格的 TypeScript 配置
- 使用 `zod` 进行运行时类型验证
- 数据库类型自动生成，不手动维护
- 严格模式配置在 `tsconfig.json` 中

### 3. 代码质量
- 使用 **ESLint** 和 **@antfu/eslint-config** 进行代码检查 每次生成代码后必须检查eslint错误
- 使用 **Husky** 和 **lint-staged** 进行提交前检查
- 组件开发使用 **Storybook**
- 配置文件：`eslint.config.mjs`, `lint-staged.config.js`

### 4. 性能优化
- 使用 **动态导入** 进行代码分割
- 图片使用 Next.js Image 组件优化
- 启用 **Turbopack** 提升开发体验
- 视频组件使用 `dynamic` 导入避免 SSR 问题

## 开发工作流规则

### 1. 开发命令
- 开发: `npm run dev` (使用 Turbopack)
- 构建: `npm run build`
- 类型检查: `npm run check-types`
- 代码检查: `npm run lint`
- 修复代码: `npm run lint:fix`
- Storybook: `npm run storybook`

### 2. 数据库迁移
- 使用 Supabase CLI 管理数据库迁移
- 迁移文件存放在 `supabase/migrations/` 目录
- 必须包含回滚脚本
- 重要迁移：积分系统、图像编辑表、Stripe 集成

### 3. 部署
- 支持 Vercel 部署
- 环境变量配置完整
- 数据库连接和存储配置正确
- Next.js 配置在 `next.config.mjs` 中

## 错误处理规则

### 1. 用户体验
- 所有异步操作必须有加载状态 (`Spinner`, `Loader2`)
- 错误信息必须用户友好
- 支持重试机制
- 状态显示：等待中、处理中、已完成、失败

### 2. 日志记录
- 关键操作必须记录日志
- 错误信息包含足够的上下文
- 生产环境不暴露敏感信息

## AI 助手特定规则

### 1. 代码生成
- 优先使用项目已有的组件和模式
- 遵循项目的命名约定和代码风格
- 确保类型安全，避免 `any` 类型
- 使用项目配置的 ESLint 规则

### 2. 功能实现
- 新功能必须考虑积分消耗
- 数据库操作必须通过服务层
- UI 组件优先使用 HeroUI
- 国际化支持必须考虑在内

### 3. 调试协助
- 检查 Supabase 连接和权限
- 验证环境变量配置
- 确认数据库迁移状态
- 检查 Stripe webhook 配置

### 4. 最佳实践
- 遵循 React 最佳实践
- 使用 TypeScript 严格模式
- 考虑性能和用户体验
- 确保代码可维护性和可扩展性

这些规则确保项目的一致性、可维护性和扩展性，同时保持代码质量和用户体验。AI 助手应严格遵循这些规则来协助开发工作。
