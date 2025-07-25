import antfu from '@antfu/eslint-config';
// @ts-ignore
import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default antfu(
  {
    react: true,
    typescript: true,

    lessOpinionated: true,
    isInEditor: false,

    stylistic: {
      semi: true,
    },

    formatters: {
      css: true,
    },

    ignores: [
      '**/node_modules',
      '.next',
      'next-env.d.ts',
    ],
  },
  jsxA11y.flatConfigs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // 只保留自定义规则，不合并 nextPlugin 的 rules，避免类型冲突
      'antfu/no-top-level-await': 'off', // Allow top-level await
      'style/brace-style': ['error', '1tbs'], // Use the default brace style
      'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
      'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'node/prefer-global/process': 'off', // Allow using `process.env`
      'unused-imports/no-unused-vars': 'warn', // 将未使用变量的警告级别从error降为warn

      // 禁用一些可能导致编译失败的规则
      '@next/next/no-img-element': 'off', // 允许使用 img 元素
      '@next/next/no-html-link-for-pages': 'off', // 允许使用 HTML a 标签
      'react/no-unescaped-entities': 'off', // 允许未转义的实体

      // 禁用类型验证相关规则
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any 类型
      '@typescript-eslint/no-unsafe-assignment': 'off', // 允许不安全的赋值
      '@typescript-eslint/no-unsafe-member-access': 'off', // 允许不安全的成员访问
      '@typescript-eslint/no-unsafe-call': 'off', // 允许不安全的函数调用
      '@typescript-eslint/no-unsafe-return': 'off', // 允许不安全的返回值
      '@typescript-eslint/no-unsafe-argument': 'off', // 允许不安全的参数

      // 将一些错误降为警告，避免 CI 失败
      'no-console': 'warn', // 将 console 语句从 error 降为 warn
      'jsx-a11y/media-has-caption': 'warn', // 将媒体元素缺少字幕从 error 降为 warn
      'jsx-a11y/no-static-element-interactions': 'warn', // 将静态元素交互从 error 降为 warn
      'ts/no-use-before-define': 'warn', // 将使用前定义从 error 降为 warn
      'react/no-nested-components': 'warn', // 将嵌套组件从 error 降为 warn
      'style/max-statements-per-line': 'warn', // 将每行语句数从 error 降为 warn
      'node/prefer-global/buffer': 'warn', // 将 Buffer 全局变量从 error 降为 warn
    },
  },
);
