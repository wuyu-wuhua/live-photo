# Auth Client 使用指南

这个模块提供了完整的 Supabase 认证功能，包括邮箱注册/登录、第三方 OAuth 登录、密码重置等功能。

## 功能特性

- ✅ 邮箱密码注册/登录
- ✅ GitHub OAuth 登录
- ✅ Google OAuth 登录
- ✅ 密码重置
- ✅ 用户登出
- ✅ 获取当前用户和会话
- ✅ 认证状态监听
- ✅ 双因素认证 (MFA)

## 基本用法

### 导入函数

```typescript
import {
  getCurrentUser,
  getSession,
  onAuthStateChange,
  resetPassword,
  signIn,
  signInWithGitHub,
  signInWithGoogle,
  signOut,
  signUp,
  twoFactor
} from '@/lib/auth-client';
```

### 用户注册

```typescript
const handleSignUp = async () => {
  const { user, session, error } = await signUp(email, password);

  if (error) {
    console.error('注册失败:', error.message);
    return;
  }

  console.log('注册成功:', user);
};
```

### 用户登录

```typescript
const handleSignIn = async () => {
  const { user, session, error } = await signIn(email, password);

  if (error) {
    console.error('登录失败:', error.message);
    return;
  }

  console.log('登录成功:', user);
};
```

### GitHub 登录

```typescript
const handleGitHubLogin = async () => {
  const { user, session, error } = await signInWithGitHub();

  if (error) {
    console.error('GitHub登录失败:', error.message);
  }

  // OAuth 登录会重定向到 GitHub，然后返回到 /auth/callback
};
```

### Google 登录

```typescript
const handleGoogleLogin = async () => {
  const { user, session, error } = await signInWithGoogle();

  if (error) {
    console.error('Google登录失败:', error.message);
  }

  // OAuth 登录会重定向到 Google，然后返回到 /auth/callback
};
```

### 用户登出

```typescript
const handleSignOut = async () => {
  const { error } = await signOut();

  if (error) {
    console.error('登出失败:', error.message);
    return;
  }

  console.log('登出成功');
};
```

### 获取当前用户

```typescript
const user = await getCurrentUser();
if (user) {
  console.log('当前用户:', user);
} else {
  console.log('用户未登录');
}
```

### 获取当前会话

```typescript
const session = await getSession();
if (session) {
  console.log('当前会话:', session);
} else {
  console.log('无活跃会话');
}
```

### 密码重置

```typescript
const handleResetPassword = async () => {
  const { error } = await resetPassword(email);

  if (error) {
    console.error('密码重置失败:', error.message);
    return;
  }

  console.log('密码重置邮件已发送');
};
```

### 监听认证状态变化

```typescript
const unsubscribe = onAuthStateChange((event, session) => {
  console.log('认证状态变化:', event, session);

  if (event === 'SIGNED_IN') {
    console.log('用户已登录');
  } else if (event === 'SIGNED_OUT') {
    console.log('用户已登出');
  }
});

// 组件卸载时取消订阅
return () => unsubscribe();
```

### 双因素认证

```typescript
const handleTwoFactor = async () => {
  const { user, session, error } = await twoFactor(
    factorId,
    challengeId,
    verificationCode
  );

  if (error) {
    console.error('双因素认证失败:', error.message);
    return;
  }

  console.log('双因素认证成功:', user);
};
```

## 错误处理

所有函数都返回一个包含 `error` 字段的对象。如果操作成功，`error` 为 `null`；如果失败，`error` 包含错误信息。

```typescript
const { user, session, error } = await signIn(email, password);

if (error) {
  // 处理错误
  switch (error.message) {
    case 'Invalid login credentials':
      setError('邮箱或密码错误');
      break;
    case 'Email not confirmed':
      setError('请先验证您的邮箱');
      break;
    default:
      setError('登录失败，请重试');
  }
  return;
}

// 登录成功
console.log('用户登录成功:', user);
```

## OAuth 回调处理

项目已经包含了 OAuth 回调页面 `/auth/callback`，它会自动处理 GitHub 和 Google 登录的重定向。

## 类型定义

```typescript
type AuthResponse = {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
};
```

## 注意事项

1. **OAuth 登录**: GitHub 和 Google 登录会重定向到相应的 OAuth 提供商，然后返回到 `/auth/callback` 页面。

2. **邮箱验证**: 注册后用户需要验证邮箱才能完全激活账户。

3. **环境变量**: 确保在 `.env.local` 中设置了正确的 Supabase 环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **OAuth 配置**: 在 Supabase 控制台中配置 GitHub 和 Google OAuth 应用。

5. **重定向 URL**: 确保在 OAuth 应用中设置正确的重定向 URL：
   ```
   http://localhost:3000/auth/callback (开发环境)
   https://yourdomain.com/auth/callback (生产环境)
   ```
