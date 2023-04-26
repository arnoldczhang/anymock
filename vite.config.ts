import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      eslintrc: {
        enabled: true,
      },
      imports: ['vue', 'vue-router', 'pinia'],
      dts: './auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: [
      {
        find: /@\//,
        replacement: path.resolve('src') + '/',
      },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          element: ['element-plus', '@element-plus/icons-vue'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          hack: `true; @import (reference) "${path.resolve(
            __dirname,
            'src/ui/style.less'
          )}";`,
        },
      },
    },
  },
});
