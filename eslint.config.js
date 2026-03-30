const js = require('@eslint/js')
const vuePlugin = require('eslint-plugin-vue')
const globals = require('globals')

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'unpackage/**'],
  },
  js.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-undef': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
]
