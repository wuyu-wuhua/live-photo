# Supabase 实时订阅 Hooks

## 概述

本目录包含了用于与Supabase实时订阅功能交互的自定义React Hooks。这些Hooks可以帮助你监听数据库表的变更，而无需使用传统的轮询方式。

## 主要功能

### `useSupabaseSubscription`

这是一个通用的订阅Hook，可以用于监听任何Supabase表的变更。

```typescript
function useSupabaseSubscription<T = any>(
  options: UseSupabaseSubscriptionOptions,
  callback: SubscriptionCallback<T>
): { isSubscribed: boolean; error: string | null };
```

#### 参数

- `options`: 订阅选项
  - `table`: 要监听的表名
  - `schema`: 数据库schema (默认: 'public')
  - `event`: 要监听的事件类型 ('INSERT', 'UPDATE', 'DELETE', '*')
  - `filter`: 过滤条件 (例如: 'id=eq.$1')
  - `filterValues`: 过滤条件的值
- `callback`: 当收到变更时调用的回调函数

#### 返回值

- `isSubscribed`: 是否已成功订阅
- `error`: 如果订阅失败，包含错误信息

### `useImageEditStatusSubscription`

专门用于监听特定图像编辑任务的状态变更。

```typescript
function useImageEditStatusSubscription(
  imageId: string,
  callback: (result: ImageEditResult) => void
): { isSubscribed: boolean; error: string | null };
```

#### 参数

- `imageId`: 要监听的图像编辑任务ID
- `callback`: 当任务状态更新时调用的回调函数

### `useImageEditsByStatusSubscription`

用于监听特定状态的所有图像编辑任务。

```typescript
function useImageEditsByStatusSubscription(
  status: TaskStatus,
  callback: (result: ImageEditResult) => void
): { isSubscribed: boolean; error: string | null };
```

#### 参数

- `status`: 要监听的任务状态 ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED')
- `callback`: 当有任务状态更新时调用的回调函数

## 使用示例

### 监听特定任务的状态变更

```tsx
import { useImageEditStatusSubscription } from '@/hooks/useSupabaseSubscription';

function TaskMonitor({ taskId }: { taskId: string }) {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);

  const { isSubscribed, error } = useImageEditStatusSubscription(
    taskId,
    (updatedTask) => {
      setTaskStatus(updatedTask.status);

      if (updatedTask.status === 'SUCCEEDED') {
        // 处理任务成功完成的逻辑
      } else if (updatedTask.status === 'FAILED') {
        // 处理任务失败的逻辑
      }
    }
  );

  return (
    <div>
      <p>
        Task Status:
        {taskStatus || 'Unknown'}
      </p>
      <p>
        Subscription:
        {isSubscribed ? 'Active' : 'Inactive'}
      </p>
      {error && (
        <p>
          Error:
          {error}
        </p>
      )}
    </div>
  );
}
```

## 注意事项

1. 确保在Supabase项目中已启用实时订阅功能，并将相关表添加到`supabase_realtime`发布中。

   ```sql
   -- 启用实时订阅
   ALTER PUBLICATION supabase_realtime ADD TABLE image_edit_results;
   ```

2. 订阅会在组件卸载时自动清理。

3. 如果需要监听多个表或使用复杂的过滤条件，可以使用多个`useSupabaseSubscription`实例。

4. 实时订阅功能需要稳定的网络连接，在网络不稳定的情况下可能会出现延迟或断开。
