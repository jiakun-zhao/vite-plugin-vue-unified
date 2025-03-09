# vite-plugin-vue-unified

![npm version](https://img.shields.io/npm/v/vite-plugin-vue-unified?color=%23954)

Transform markdown to vue with Unified.

### Install

```bash
pnpm i -D vite-plugin-vue-unified
```

### Usage

```ts
// vite.config.ts

import { defineConfig } from 'vite'
import markdown from 'vite-plugin-vue-unified'

export default defineConfig({
  plugins: [
    markdown()
  ]
})
```

### Transform

See [tests](./src/transform.test.ts)

### LICENSE

MIT License © 2025-PRESENT [Jiakun Zhao](https://github.com/jiakun-zhao)