'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6">
      <h2 className="text-2xl font-bold text-destructive">发生错误!</h2>
      <button type="button" onClick={() => reset()}>重试</button>
    </div>
  );
}
