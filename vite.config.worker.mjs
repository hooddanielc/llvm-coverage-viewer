import {join} from 'node:path';

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PACKAGE_ROOT = __dirname;
const empty = join(PACKAGE_ROOT, 'src/app/util/empty.js');


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  mode: 'development',
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
      'path': empty,
      'fs': empty,
      'punycode': empty,
      'buffer': empty,
      'events': empty,
    },
  },
  build: {
    outDir: "dist/worker",
    minify: false,
    rollupOptions: {
      input: [
        'src/app/llvm-coverage-viewer-highlight-worker.js',
      ],
      output: {
        entryFileNames: '[name].js',
      },
    }
  }
})
