import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.API_302AI_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'API密钥未配置',
    });
  }

  try {
    // 测试API连接 - 尝试不同的认证方式
    const testResults = [];

    // 测试1: Bearer认证
    try {
      const response1 = await fetch('https://api.302.ai/302/submit/colorize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      const errorText1 = await response1.text();
      testResults.push({
        method: 'Bearer',
        status: response1.status,
        statusText: response1.statusText,
        error: errorText1,
      });
    } catch (e) {
      testResults.push({
        method: 'Bearer',
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // 测试2: X-API-Key认证
    try {
      const response2 = await fetch('https://api.302.ai/302/submit/colorize', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      const errorText2 = await response2.text();
      testResults.push({
        method: 'X-API-Key',
        status: response2.status,
        statusText: response2.statusText,
        error: errorText2,
      });
    } catch (e) {
      testResults.push({
        method: 'X-API-Key',
        error: e instanceof Error ? e.message : String(e),
      });
    }

    return NextResponse.json({
      success: true,
      apiKey: `${apiKey.substring(0, 10)}...`,
      testResults,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      apiKey: `${apiKey.substring(0, 10)}...`,
    });
  }
}
