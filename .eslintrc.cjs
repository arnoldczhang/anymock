module.exports = {
  // 此项是用来告诉eslint找当前配置文件不能往父级查找
  root: true,
  // 全局环境
  env: {
    node: true,
  },
  globals: {
    chrome: 'readonly',
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
    process: true,
    require: true,
  },
  // 指定如何解析语法。可以为空，但若不为空，只能配该值
  parser: 'vue-eslint-parser',
  // 优先级低于parse的语法解析配置
  parserOptions: {
    // 指定ESlint的解析器
    parser: '@typescript-eslint/parser',
    // 允许使用ES语法
    ecmaVersion: 2020,
    // 允许使用import
    sourceType: 'module',
    // 允许解析JSX
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['sonarjs', 'simple-import-sort'],
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/eslint-config-typescript',
    './.eslintrc-auto-import.json',
  ],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    semi: 'error',
    'no-trailing-spaces': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'sonarjs/cognitive-complexity': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-types': 'off',
    // vue
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    // Prettier
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        htmlWhitespaceSensitivity: 'ignore',
      },
    ],
  },
  ignorePatterns: ['node_modules', 'src/ks/api/types', '*.d.ts'],
};
