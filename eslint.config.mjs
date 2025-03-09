/* eslint perfectionist/sort-objects: "error" */

import defineConfig from '@antfu/eslint-config'

export default defineConfig({
  rules: {
    'no-console': 'warn',
    'style/brace-style': ['warn', '1tbs'],
    'style/jsx-one-expression-per-line': 'off',
    'style/jsx-quotes': ['warn', 'prefer-single'],
    'ts/ban-ts-comment': 'off',
    'ts/no-unused-expressions': 'off',
    'unused-imports/no-unused-imports': 'warn',
  },
})
