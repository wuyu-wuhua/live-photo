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
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    rules: {
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
    },
  },
);
